import db from './db.js';

// eslint-disable-next-line no-unused-vars
export const selectPeople = async (options) => {
  const results = await db.query('SELECT * FROM public.people');
  const formattedData = {
    resultData: results.rows,
    dataLength: results.rowCount,
  };
  return formattedData;
};

export const insertPerson = async (
  {
    name,
    weight,
    married,
    // TODO: renamed to made consistent
    date: birthDate,
  },
) => {
  const results = await db.query(
    'INSERT INTO public.people(name, weight, married, "birthDate") VALUES ($1, $2, $3, $4) RETURNING *',
    // TODO: redo date/time handling
    [name, weight, married, birthDate.concat(' 00:00:00')],
  );
  return results.rows[0].id;
};

export const updatePerson = async (
  {
    name,
    weight,
    married,
    date: birthDate,
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
