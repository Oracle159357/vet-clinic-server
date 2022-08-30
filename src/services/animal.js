import { faker } from '@faker-js/faker';
import CustomError from '../errors/custom-error.js';
import { allAnimals, allPeople } from '../db/mock-data.js';
import {
  process,
  deleteFromDataByIdsTableV2,
  calculateAge,
} from './common.js';

export async function getAnimals(options) {
  return process(allAnimals, options || {});
}

export async function addAnimal(data) {
  const findDuplicateName = allAnimals.findIndex((animal) => animal.dogName === data.dogName);
  if (findDuplicateName >= 0) {
    throw new CustomError({
      dogName: 'This name already exists',
    });
  }
  const peopleByOwner = allPeople.find((people) => people.id === data.ownerId);
  const newData = {
    idKey: faker.datatype.uuid(),
    dogName: data.dogName,
    age: calculateAge(new Date(data.date)),
    height: data.height,
    birthDate: new Date(data.date),
    owner: peopleByOwner,
  };
  allAnimals.push(newData);
  return newData.idKey;
}

export async function changeAnimal(changedData) {
  const peopleByOwner = allPeople.find((people) => people.id === changedData.ownerId);
  const newData = {
    idKey: changedData.idKey,
    dogName: changedData.dogName,
    age: calculateAge(new Date(changedData.date)),
    height: changedData.height,
    birthDate: new Date(changedData.date),
    owner: peopleByOwner,
  };
  const findIndexElement = allAnimals
    .findIndex((animal) => animal.idKey === changedData.idKey);
  // eslint-disable-next-line no-param-reassign
  allAnimals[findIndexElement] = newData;
  return changedData.idKey;
}

export async function deleteAnimal(ids) {
  return deleteFromDataByIdsTableV2(allAnimals, ids, 'idKey');
}
