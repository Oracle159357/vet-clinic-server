import named from 'yesql';
import db from './db.js';
import { createFilteringCondition, createPagingCondition, createSortingCondition } from './common.js';

const namedQuery = named.pg;

const baseTypeOfColumn = {
  dogName: 'string',
  age: 'number',
  birthDate: 'date',
  height: 'number',
  ownerId: 'string', // HZ
};

export const existsByDogName = async (animalDogName) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.animal WHERE "dogName" = $1', [animalDogName]);

  return countQueryResult.rows[0].count > 0;
};

export const selectAnimals = async (options = {}) => {
  const countQueryResult = await db.query('SELECT count(*) FROM public.animal ');
  const dataLength = countQueryResult.rows[0].count;

  const { paging } = options;
  const { pagingCondition, pagingVariables } = createPagingCondition(paging);
  const { sortingCondition } = createSortingCondition(undefined);
  const { filteringCondition, filteringVariables } = createFilteringCondition(
    baseTypeOfColumn,
    undefined,
  );

  const animalsQueryResult = await db.query(
    namedQuery(
      `SELECT *
       FROM public.animal ${filteringCondition || ''} ${sortingCondition || ''} ${pagingCondition || ''}`,
    )({ ...filteringVariables, ...pagingVariables }),
  );

  const formattedData = {
    resultData: animalsQueryResult.rows,
    dataLength,
  };

  return formattedData;
};

export const insertAnimal = async (
  {
    dogName,
    height,
    birthDate,
    ownerId,
  },
) => {
  const results = await db.query(
    'INSERT INTO public.animal("dogName", height, "birthDate", "ownerId") VALUES ($1, $2, $3, $4) RETURNING *',
    [dogName, height, birthDate, ownerId],
  );
  return results.rows[0].idKey;
};

export const updateAnimal = async (
  {
    dogName,
    height,
    birthDate,
    idKey,
    ownerId,
  },
) => {
  await db.query(
    'UPDATE public.animal SET "dogName" = $1, height = $2, "birthDate" = $3 , "ownerId" = $4 WHERE "idKey" = $5',
    [dogName, height, birthDate, ownerId, idKey],
  );
  return idKey;
};

export const deleteAnimals = async (ids) => {
  await db.query(
    'DELETE FROM public.animal WHERE "idKey" = ANY($1::bigint[])',
    [ids],
  );
  return ids;
};
