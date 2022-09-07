import express from 'express';
import asyncHandler from 'express-async-handler';
import * as peopleService from '../services/people.js';

export const peopleController = express.Router();

peopleController.post('/', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await peopleService.getPeoples(options);
  res.status(200).send(data);
}));

peopleController.post('/add', asyncHandler(async (req, res) => {
  const newPerson = req.body;
  const data = await peopleService.addPerson(newPerson);
  res.status(200).send(JSON.stringify(data));
}));

peopleController.post('/change', asyncHandler(async (req, res) => {
  const person = req.body;
  const data = await peopleService.changePerson(person);
  res.status(200).send(JSON.stringify(data));
}));

peopleController.post('/remove', asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await peopleService.removePeople(ids);
  res.status(200).send(JSON.stringify(data));
}));

export default peopleController;
