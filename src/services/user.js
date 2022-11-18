import * as userDb from '../db/user.js';
import CustomError from '../errors/custom-error.js';

export const getUsers = (options) => userDb.selectUsers(options);

export const addUser = async (user) => {
  const allIdByName = await userDb.getUsersIdsByName(user.username);

  if (allIdByName.length > 0) {
    throw new CustomError({
      username: 'This username already exists',
    });
  }

  return userDb.insertUser(user);
};

export const changeUser = async (changedUser) => {
  const allIdByName = await userDb.getUsersIdsByName(changedUser.username);
  const filterAllId = allIdByName.filter((id) => id !== changedUser.id);

  if (filterAllId.length > 0) {
    throw new CustomError({
      username: 'This username already exists',
    });
  }

  return userDb.updateUser(changedUser);
};

export const deactivateUsers = (ids) => userDb.deactivateUsers(ids);
