import express from 'express';
import asyncHandler from 'express-async-handler';
import * as userService from '../services/user.js';
import { isAdmin } from '../middleware/auth.js';

export const userController = express.Router();

userController.post('', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await userService.getUsers(options);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/add', isAdmin, asyncHandler(async (req, res) => {
  const newUser = req.body;
  const data = await userService.addUser(newUser);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/update', isAdmin, asyncHandler(async (req, res) => {
  const user = req.body;
  const data = await userService.changeUser(user);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/deactivate', isAdmin, asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await userService.deactivateUsers(ids);
  res.status(200).send(JSON.stringify(data));
}));

export default userController;
