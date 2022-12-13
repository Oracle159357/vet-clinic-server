import express from 'express';
import asyncHandler from 'express-async-handler';
import * as userService from '../services/user.js';

export const userController = express.Router();

userController.post('', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await userService.getUsers(options);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/add', asyncHandler(async (req, res) => {
  const newUser = req.body;
  const data = await userService.addUser(newUser);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/update', asyncHandler(async (req, res) => {
  const user = req.body;
  const data = await userService.changeUser(user);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/deactivate', asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await userService.deactivateUsers(ids);
  res.status(200).send(JSON.stringify(data));
}));

userController.post('/login', asyncHandler(async (req, res) => {
  const loginAndPassword = req.body;
  const data = await userService.loginUser(loginAndPassword);
  res.status(200).send(JSON.stringify(data));
}));

export default userController;
