import jwt from 'jsonwebtoken';
import * as userDb from '../db/user.js';
import CustomError from '../errors/custom-error.js';
import { comparePasswords } from '../utils/password-encryption.js';

export const loginUser = async ({ username, password }) => {
  const userByName = await userDb.getUserByName(username);

  if (userByName === undefined || userByName.isActive === false) {
    throw new CustomError({
      username: 'The username may not be correct',
      password: 'The password may not be correct',
    });
  }

  const validatePassword = await comparePasswords(password, userByName.password);

  if (!validatePassword) {
    throw new CustomError({
      username: 'The username may not be correct',
      password: 'The password may not be correct',
    });
  }

  const payload = { id: userByName.id };
  const token = jwt.sign(payload, process.env.TOKEN_SECRET);

  return { token };
};
export const getUserIsActiveById = async (id) => userDb.selectIsActiveById(id);
