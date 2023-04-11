import _ from 'lodash';
import * as userDb from '../db/user.js';
import CustomError from '../errors/custom-error.js';
import { encryptPassword } from '../utils/password-encryption.js';

export const getUsers = async (options) => {
  const result = await userDb.selectUsers(options);

  return {
    ...result,
    resultData: result.resultData.map((user) => _.omit(user, 'password')),
  };
};

export const addUser = async (user) => {
  const allIdByName = await userDb.getUsersIdsByName(user.username);

  if (allIdByName.length > 0) {
    throw new CustomError({
      username: 'This username already exists',
    });
  }

  if (user.password === null) {
    throw new CustomError({
      username: 'Password cannot be zero characters',
    });
  }

  if (user.password.length <= 3) {
    throw new CustomError({
      password: 'You must enter a password consisting of at least four characters',
    });
  }

  const hashedPassword = await encryptPassword(user.password);

  return userDb.insertUser({ ...user, password: hashedPassword });
};

export const changeUser = async (changedUser) => {
  const allIdByName = await userDb.getUsersIdsByName(changedUser.username);
  const filterAllId = allIdByName.filter((id) => id !== changedUser.id);

  if (filterAllId.length > 0) {
    throw new CustomError({
      username: 'This username already exists',
    });
  }

  if (changedUser.password === null) {
    const output = _.omit(changedUser, 'password');

    return userDb.updateUser(output);
  }

  if (changedUser.password.length <= 3) {
    throw new CustomError({
      password: 'You must enter a password consisting of at least four characters',
    });
  }

  const hashedPassword = await encryptPassword(changedUser.password);

  return userDb.updateUser({ ...changedUser, password: hashedPassword });
};

export const deactivateUsers = (ids) => userDb.deactivateUsers(ids);
