import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  getPeoples,
  addPerson,
  changePerson,
  deletePeople,
} from '../services/people.js';

export const peopleController = express.Router();

peopleController.post('/', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await getPeoples(options);
  res.status(200).send(data);
}));

peopleController.post('/add', asyncHandler(async (req, res) => {
  const newPerson = req.body;
  const data = await addPerson(newPerson);
  res.status(200).send(JSON.stringify(data));
}));

peopleController.post('/update', asyncHandler(async (req, res) => {
  const people = req.body;
  const data = await changePerson(people);
  res.status(200).send(JSON.stringify(data));
}));

peopleController.post('/delete', asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await deletePeople(ids);
  res.status(200).send(JSON.stringify(data));
}));

export default peopleController;
