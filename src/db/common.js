import pgFormat from 'node-pg-format';
import named from 'yesql';
import { metaDataAboutTables } from './metadata.js';
import {
  createRoot,
  findNode,
  pushNode,
  toArray,
} from '../utils/table-dependency-tree.js';
import db from './db.js';

const namedQuery = named.pg;

export function createQuoteNestedIdent(id) {
  return id.split('.').map((partOfId) => pgFormat.quoteIdent(partOfId)).join('.');
}

function createVariableNameById(id) {
  return `${id.replace('.', '_')}`;
}

function createStringFilter(filter) {
  const { id, value } = filter;

  const quoteNestedIdent = createQuoteNestedIdent(id);
  const valueVariableName = createVariableNameById(id);

  return {
    condition: `${quoteNestedIdent} ~* :${valueVariableName} `,
    variables: {
      [valueVariableName]: value,
    },
  };
}

function createBooleanFilter(filter) {
  const { id, value } = filter;

  const quoteNestedIdent = createQuoteNestedIdent(id);
  const valueVariableName = createVariableNameById(id);

  return {
    condition: `${quoteNestedIdent} = :${valueVariableName}`,
    variables: {
      [valueVariableName]: value,
    },
  };
}

function createRangeFilter(filter) {
  const { id, value: { from, to } } = filter;

  const quoteNestedIdent = createQuoteNestedIdent(id);
  const valueVariableNameFrom = createVariableNameById(id).concat('_from');
  const valueVariableNameTo = createVariableNameById(id).concat('_to');

  const conditions = [];
  const variables = {};

  if (from) {
    variables[valueVariableNameFrom] = from;
    conditions.push(`${quoteNestedIdent} >= :${valueVariableNameFrom} `);
  }
  if (to) {
    variables[valueVariableNameTo] = to;
    conditions.push(`${quoteNestedIdent} < :${valueVariableNameTo} `);
  }

  return {
    condition: conditions.join(' AND '),
    variables,
  };
}

function createNumberFilter(filter) {
  if (!!Object.getOwnPropertyDescriptor(filter.value, 'from')
    || !!Object.getOwnPropertyDescriptor(filter.value, 'to')) {
    return createRangeFilter(filter);
  }

  throw new Error('Filter number value (from and to) have both value undefined');
}

function createDateFilter(filter) {
  if (!!Object.getOwnPropertyDescriptor(filter.value, 'from')
    || !!Object.getOwnPropertyDescriptor(filter.value, 'to')) {
    return createRangeFilter(filter);
  }

  throw new Error('Filter date value (from and to) have both value undefined');
}

export function createFilteringCondition(baseTable, filters) {
  if (filters === undefined) {
    return { filteringCondition: null, filteringVariables: {} };
  }
  const filtersConditionAndVariable = filters.map((filter) => {
    let currentTable;
    let currentColumn;
    const idSplit = filter.id.split('.');
    if (idSplit.length === 1) {
      currentTable = baseTable;
      [currentColumn] = idSplit;
    } else if (idSplit.length === 2) {
      [currentTable] = idSplit;
      [, currentColumn] = idSplit;
    } else {
      throw new Error(`Invalid id: ${idSplit}`);
    }
    const typeOfColumn = metaDataAboutTables[currentTable].columnsTypes[currentColumn];
    switch (typeOfColumn) {
      case 'string':
        return createStringFilter(filter);
      case 'boolean':
        return createBooleanFilter(filter);
      case 'number':
        return createNumberFilter(filter);
      case 'date':
        return createDateFilter(filter);
      default:
        throw new Error(`Not supported data type: ${typeOfColumn}`);
    }
  });

  const filteringCondition = 'WHERE '.concat(
    filtersConditionAndVariable.map((currentFilter) => currentFilter.condition).join(' AND '),
  );

  const filteringVariables = filtersConditionAndVariable
    .reduce(
      (acc, item) => ({ ...acc, ...item.variables }),
      {},
    );

  return { filteringCondition, filteringVariables };
}

export function createSortingCondition(sorting) {
  if (sorting === undefined) {
    return { sortingCondition: null };
  }

  return {
    sortingCondition: 'ORDER BY '.concat(
      sorting
        .map(({ id, desc }) => `public.${createQuoteNestedIdent(id)} ${desc ? 'desc' : 'asc'}`)
        .join(', '),
    ),
  };
}

export function extractIdsFromOptions(options) {
  const { sorting, filters } = options;

  return [
    ...(sorting || []).map((el) => el.id),
    ...(filters || []).map((el) => el.id),
  ];
}

export function transformIds(ids, tree) {
  return ids.reduce((acc, fullId) => {
    const node = findNode(fullId, tree);

    if (node === null) {
      throw new Error(`Unexpected id: ${fullId}`);
    }

    const idBySplit = fullId.split('.');
    const id = idBySplit[idBySplit.length - 1];

    return { ...acc, [fullId]: `${node.data.table}.${id}` };
  }, {});
}

function createJoinMetadata(allIds, rootTable) {
  const tree = createRoot(rootTable);

  allIds.forEach((id) => pushNode(id, tree, metaDataAboutTables));

  const transformedIds = transformIds(allIds, tree);
  const joinMetadata = toArray(tree)
    .filter(({ parent }) => parent !== undefined)
    .map(({ node, parent }) => ({
      sourceTable: parent.data.table,
      targetTable: node.data.table,
      joinColumn: node.data.joinColumn,
    }));

  return {
    transformedIds,
    joinMetadata,
  };
}

export function createFromCondition(ids, baseTable) {
  const { joinMetadata, transformedIds } = createJoinMetadata(
    ids,
    baseTable,
  );

  const joiningCondition = joinMetadata.map((condition) => {
    const sourceTableQuoteIdent = pgFormat.quoteIdent(condition.sourceTable);
    const targetTableQuoteIdent = pgFormat.quoteIdent(condition.targetTable);

    const sourceTableIdQuoteIdent = pgFormat
      .quoteIdent(metaDataAboutTables[condition.sourceTable]
        .references[condition.joinColumn].columnReference);
    const targetTableIdQuoteIdent = pgFormat
      .quoteIdent(metaDataAboutTables[condition.targetTable].tableId);

    return `JOIN public.${targetTableQuoteIdent} ON public.${sourceTableQuoteIdent}.${sourceTableIdQuoteIdent} = public.${targetTableQuoteIdent}.${targetTableIdQuoteIdent}`;
  }).join(' ');
  const fromPart = ` FROM public.${baseTable} ${joiningCondition}`;

  return {
    fromPart,
    transformedIds,
  };
}

export function createPagingCondition(paging) {
  if (paging === undefined) {
    return { pagingCondition: null, pagingVariables: {} };
  }

  return {
    pagingCondition: 'LIMIT :limit OFFSET :offset',
    pagingVariables: {
      limit: paging.size,
      offset: paging.page * paging.size,
    },
  };
}

export function transformOptionsIds(transformedIds, options) {
  let normalizeDataForSort;
  let normalizeDataForFilters;

  if (options.sorting !== undefined) {
    normalizeDataForSort = options.sorting
      .map((el) => ({ ...el, id: transformedIds[el.id] }));
  }

  if (options.filters !== undefined) {
    normalizeDataForFilters = options.filters
      .map((el) => ({ ...el, id: transformedIds[el.id] }));
  }

  return { ...options, sorting: normalizeDataForSort, filters: normalizeDataForFilters };
}

async function countOfElementByFromAndFilter(fromPart, filteringCondition, filteringVariables) {

}

export async function selectDataFromTheTableByNameAndOptions(baseTable, options) {
  const {
    fromPart,
    transformedIds,
  } = createFromCondition(extractIdsFromOptions(options), baseTable);

  const {
    sorting,
    filters,
    paging,
  } = transformOptionsIds(transformedIds, options);

  const { pagingCondition, pagingVariables } = createPagingCondition(paging);
  const { sortingCondition } = createSortingCondition(sorting);
  const { filteringCondition, filteringVariables } = createFilteringCondition(
    baseTable,
    filters,
  );

  const queryResult = await db.query(
    namedQuery(
      `SELECT public.${createQuoteNestedIdent(baseTable)}.*
       ${fromPart || ''} ${filteringCondition || ''} ${sortingCondition || ''} ${pagingCondition || ''}`,
    )({ ...filteringVariables, ...pagingVariables }),
  );

  const countQueryResult = await db.query(
    namedQuery(
      `SELECT count(*)::int ${fromPart || ''} ${filteringCondition || ''} `,
    )({ ...filteringVariables }),
  );
  const dataLength = countQueryResult.rows[0].count;

  return {
    resultData: queryResult.rows,
    dataLength,
  };
}
