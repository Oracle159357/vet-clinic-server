import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  getAnimals,
  addAnimal,
  changeAnimal,
  deleteAnimal,
} from '../services/animal.js';

export const animalController = express.Router();

animalController.post('', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await getAnimals(options);
  res.status(200).send(data);
}));

animalController.post('/add', asyncHandler(async (req, res) => {
  const newAnimal = req.body;
  const data = await addAnimal(newAnimal);
  res.status(200).send(JSON.stringify(data));
}));

animalController.post('/update', asyncHandler(async (req, res) => {
  const animal = req.body;
  const data = await changeAnimal(animal);
  res.status(200).send(JSON.stringify(data));
}));

animalController.post('/delete', asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await deleteAnimal(ids);
  res.status(200).send(JSON.stringify(data));
}));

export default animalController;
