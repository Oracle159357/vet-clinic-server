import db from './db.js';
import {
  selectDataFromTheTableByNameAndOptions,
} from './common.js';

export const getUsersIdsByName = async (username) => {
  const allUsersByName = await db.query('SELECT id FROM public.user WHERE username=$1', [username]);

  return allUsersByName.rows.map((el) => el.id);
};

export const getUserByName = async (username) => {
  const allUsersByName = await db.query('SELECT * FROM public.user WHERE username=$1', [username]);

  return allUsersByName.rows[0];
};

export const selectIsActiveById = async (userId) => {
  const selectPeopleByIdsQueryResult1 = await db.query('SELECT "isActive" FROM public.user WHERE "id" = $1', [userId]);

  if (selectPeopleByIdsQueryResult1.rows.length === 0) {
    return null;
  }

  return selectPeopleByIdsQueryResult1.rows[0].isActive;
};

export const selectUsers = async (options = {}) => (
  selectDataFromTheTableByNameAndOptions('user', options)
);

export const insertUser = async (
  {
    username,
    password,
    isAdmin,
    isActive,
  },
) => {
  const results = await db.query(
    'INSERT INTO public.user("username", "password", "isAdmin", "isActive") VALUES ($1, $2, $3, $4) RETURNING *',
    [username, password, isAdmin, isActive],
  );

  return results.rows[0].id;
};

export const updateUser = async (
  {
    id,
    username,
    password,
    isAdmin,
    isActive,
  },
) => {
  if (password === undefined) {
    await db.query(
      'UPDATE public.user SET "username" = $1, "isAdmin" = $2, "isActive" = $3 WHERE "id" = $4',
      [username, isAdmin, isActive, id],
    );
  } else {
    await db.query(
      'UPDATE public.user SET "username" = $1, "password" = $2, "isAdmin" = $3, "isActive" = $4 WHERE "id" = $5',
      [username, password, isAdmin, isActive, id],
    );
  }

  return id;
};

export const deactivateUsers = async (ids) => {
  await db.query(
    'UPDATE public.user SET "isActive" = false WHERE id = ANY($1::bigint[])',
    [ids],
  );

  return ids;
};
