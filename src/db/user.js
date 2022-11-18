import db from './db.js';
import {
  selectDataFromTheTableByNameAndOptions,
} from './common.js';

export const getUsersIdsByName = async (username) => {
  const allUsersByName = await db.query('SELECT id FROM public.user WHERE username=$1', [username]);

  return allUsersByName.rows.map((el) => el.id);
};

export const selectUserByIds = async (userIds) => {
  const selectPeopleByIdsQueryResult = await db.query('SELECT * FROM public.user WHERE "id" = ANY($1::bigint[])', [userIds]);

  return selectPeopleByIdsQueryResult.rows;
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
  await db.query(
    'UPDATE public.user SET "username" = $1, "password" = $2, "isAdmin" = $3, "isActive" = $4 WHERE "id" = $5',
    [username, password, isAdmin, isActive, id],
  );

  return id;
};

export const deactivateUsers = async (ids) => {
  await db.query(
    'UPDATE public.user SET "isActive" = false WHERE id = ANY($1::bigint[])',
    [ids],
  );

  return ids;
};
