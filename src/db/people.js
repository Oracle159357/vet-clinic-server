import named from 'yesql';
import pgFormat from 'node-pg-format';
import db from './db.js';

const namedQuery = named.pg;

const baseTypeOfColumn = {
  name: 'string',
  age: 'number',
  married: 'boolean',
  birthDate: 'date',
  height: 'number',
  weight: 'number',
};

function createStringFilter(filter) {
  const valueVariable = `${(filter.id)}Value`;

  return {
    condition: `${pgFormat.quoteIdent(filter.id)} ~* :${valueVariable} `,
    variables: {
      [valueVariable]: filter.value,
    },
  };
}

function createBooleanFilter(filter) {
  const valueVariable = `${(filter.id)}Value`;

  return {
    condition: `${pgFormat.quoteIdent(filter.id)} = :${valueVariable}`,
    variables: {
      [valueVariable]: filter.value,
    },
  };
}

function createNumberFilter(filter) {
  const { from, to } = filter.value;
  if ((from === undefined && to === undefined)) {
    throw new Error('Filter number value (from and to) have both value undefined');
  }
  const id = pgFormat.quoteIdent(filter.id);
  const conditions = [];
  const variables = {};
  if (from) {
    const valueFromNumberVariable = `${filter.id}FromNumberValue`;
    variables[valueFromNumberVariable] = from;
    conditions.push(`${id} >= :${valueFromNumberVariable} `);
  }
  if (to) {
    const valueToNumberVariable = `${(filter.id)}ToNumberValue`;
    variables[valueToNumberVariable] = to;
    conditions.push(`${id} < :${valueToNumberVariable} `);
  }

  return {
    condition: conditions.join(' AND '),
    variables,
  };
}

function createDateFilter(filter) {
  const { from, to } = filter.value;
  if ((from === undefined && to === undefined)) {
    throw new Error('Filter date value (from and to) have both value undefined');
  }
  const id = pgFormat.quoteIdent(filter.id);
  const conditions = [];
  const variables = {};
  if (from) {
    const valueFromDateVariable = `${filter.id}FromDateValue`;
    variables[valueFromDateVariable] = from;
    conditions.push(`${id} >= :${valueFromDateVariable} `);
  }
  if (to) {
    const valueToDateVariable = `${(filter.id)}ToDateValue`;
    variables[valueToDateVariable] = to;
    conditions.push(`${id} < :${valueToDateVariable} `);
  }

  return {
    condition: conditions.join(' AND '),
    variables,
  };
}

function createFilteringCondition(filters) {
  if (filters === undefined) {
    return { filteringCondition: null, filteringVariables: {} };
  }

  const filtersConditionAndVariable = filters.map((filter) => {
    const typeOfColumn = baseTypeOfColumn[filter.id];
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

function createSortingCondition(sorting) {
  if (sorting === undefined) {
    return { sortingCondition: null };
  }
  return {
    sortingCondition: 'ORDER BY '.concat(
      sorting
        .map((el) => `${pgFormat.quoteIdent(el.id)} ${el.desc ? 'desc' : 'asc'}`)
        .join(' '),
    ),
  };
}

function createPagingCondition(paging) {
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

export const existsByName = async (peopleName) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.people WHERE name=$1', [peopleName]);

  return countQueryResult.rows[0].count > 0;
};

export const selectPeople = async (options = {}) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.people ');
  const dataLength = countQueryResult.rows[0].count;

  const { paging, sorting, filters } = options;
  const { pagingCondition, pagingVariables } = createPagingCondition(paging);
  const { sortingCondition } = createSortingCondition(sorting);
  const { filteringCondition, filteringVariables } = createFilteringCondition(filters);

  const results = await db.query(
    namedQuery(
      `SELECT *
       FROM public.people ${filteringCondition || ''} ${sortingCondition || ''} ${pagingCondition || ''}`,
    )({ ...filteringVariables, ...pagingVariables }),
  );

  const formattedData = {
    resultData: results.rows,
    dataLength,
  };

  return formattedData;
};

export const insertPerson = async (
  {
    name,
    weight,
    married,
    birthDate,
  },
) => {
  const results = await db.query(
    'INSERT INTO public.people(name, weight, married, "birthDate") VALUES ($1, $2, $3, $4) RETURNING *',
    [name, weight, married, birthDate],
  );
  return results.rows[0].id;
};

export const updatePerson = async (
  {
    name,
    weight,
    married,
    birthDate,
    id,
  },
) => {
  await db.query(
    'UPDATE public.people SET name = $1, weight = $2, married = $3, "birthDate" = $4 WHERE id = $5',
    [name, weight, married, birthDate, id],
  );
  return id;
};

export const deletePeople = async (ids) => {
  await db.query(
    'DELETE FROM public.people WHERE id = ANY($1::bigint[])',
    [ids],
  );
  return ids;
};
