import pgFormat from 'node-pg-format';

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

export function createFilteringCondition(baseTypeOfColumn, filters) {
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

export function createSortingCondition(sorting) {
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
