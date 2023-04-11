import asyncHandler from 'express-async-handler';
import express from 'express';
import * as authService from '../services/auth.js';

export const authController = express.Router();

authController.post('/login', asyncHandler(async (req, res) => {
  const loginAndPassword = req.body;
  const data = await authService.loginUser(loginAndPassword);
  res.status(200).send(JSON.stringify(data));
}));

export default authController;
