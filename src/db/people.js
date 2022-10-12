import named from 'yesql';
import db from './db.js';
import { createFilteringCondition, createPagingCondition, createSortingCondition } from './common.js';

const namedQuery = named.pg;

const baseTypeOfColumn = {
  name: 'string',
  age: 'number',
  married: 'boolean',
  birthDate: 'date',
  weight: 'number',
};

export const existsByName = async (peopleName) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.people WHERE name=$1', [peopleName]);

  return countQueryResult.rows[0].count > 0;
};

export const selectPeopleByIds = async (peopleIds) => {
  const selectPeopleByIdsQueryResult = await db.query('SELECT * FROM public.people WHERE "id" = ANY($1::bigint[])', [peopleIds]);

  return selectPeopleByIdsQueryResult.rows;
};

export const selectPeople = async (options = {}) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.people ');
  const dataLength = countQueryResult.rows[0].count;

  const { paging, sorting, filters } = options;
  const { pagingCondition, pagingVariables } = createPagingCondition(paging);
  const { sortingCondition } = createSortingCondition(sorting);
  const { filteringCondition, filteringVariables } = createFilteringCondition(
    baseTypeOfColumn,
    filters,
  );

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
