import db from './db.js';
import {
  selectDataFromTheTableByNameAndOptions,
} from './common.js';

export const getAnimalsIdsByName = async (dogName) => {
  const allAnimalsByName = await db.query('SELECT "idKey" FROM public.animal WHERE "dogName"=$1', [dogName]);

  return allAnimalsByName.rows.map((el) => el.idKey);
};

export const selectAnimals = async (options = {}) => (
  selectDataFromTheTableByNameAndOptions('animal', options)
);

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
