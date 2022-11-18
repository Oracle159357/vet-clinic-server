import db from './db.js';
import {
  selectDataFromTheTableByNameAndOptions,
} from './common.js';

export const getPeoplesIdsByName = async (name) => {
  const allPeoplesByName = await db.query('SELECT id FROM public.people WHERE name=$1', [name]);

  return allPeoplesByName.rows.map((el) => el.id);
};

export const selectPeopleByIds = async (peopleIds) => {
  const selectPeopleByIdsQueryResult = await db.query('SELECT * FROM public.people WHERE "id" = ANY($1::bigint[])', [peopleIds]);

  return selectPeopleByIdsQueryResult.rows;
};

export const selectPeople = async (options = {}) => (
  selectDataFromTheTableByNameAndOptions('people', options)
);

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
