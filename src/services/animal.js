import keyBy from 'lodash.keyby';
import CustomError from '../errors/custom-error.js';
import * as animalDb from '../db/animal.js';
import * as peopleService from './people.js';

export const getAnimals = (options) => animalDb.selectAnimals(options);

export const getAnimalsWithOwners = async (options) => {
  const { resultData, dataLength } = await animalDb.selectAnimals(options);

  const ownersIds = resultData.map((animal) => animal.ownerId);
  const owners = await peopleService.getPeopleByIds(ownersIds);
  const ownersById = keyBy(owners, 'id');

  const animalsWithOwners = resultData.map(
    (animal) => ({ ...animal, owner: ownersById[animal.ownerId] }),
  );

  return { dataLength, resultData: animalsWithOwners };
};

export const addAnimal = async (animal) => {
  const allIdByName = await animalDb.getAnimalsIdsByName(animal.dogName);

  if (allIdByName.length > 0) {
    throw new CustomError({
      dogName: 'This name already exists',
    });
  }

  return animalDb.insertAnimal(animal);
};

export const changeAnimal = async (changedAnimal) => {
  const allIdByName = await animalDb.getAnimalsIdsByName(changedAnimal.dogName);
  const filterAllId = allIdByName.filter((id) => id !== changedAnimal.idKey);

  if (filterAllId.length > 0) {
    throw new CustomError({
      dogName: 'This name already exists',
    });
  }

  return animalDb.updateAnimal(changedAnimal);
};

export const removeAnimals = (ids) => animalDb.deleteAnimals(ids);
