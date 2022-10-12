import express from 'express';
import asyncHandler from 'express-async-handler';
import * as animalService from '../services/animal.js';

export const animalController = express.Router();

animalController.post('', asyncHandler(async (req, res) => {
  const options = req.body;
  const data = await animalService.getAnimalsWithOwners(options);
  res.status(200).send(JSON.stringify(data));
}));

animalController.post('/add', asyncHandler(async (req, res) => {
  const newAnimal = req.body;
  const data = await animalService.addAnimal(newAnimal);
  res.status(200).send(JSON.stringify(data));
}));

animalController.post('/update', asyncHandler(async (req, res) => {
  const animal = req.body;
  const data = await animalService.changeAnimal(animal);
  res.status(200).send(JSON.stringify(data));
}));

animalController.post('/delete', asyncHandler(async (req, res) => {
  const ids = req.body;
  const data = await animalService.removeAnimals(ids);
  res.status(200).send(JSON.stringify(data));
}));

export default animalController;
