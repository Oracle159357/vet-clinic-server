import { faker } from '@faker-js/faker';
import CustomError from '../errors/custom-error.js';
import { allPeople } from '../db/mock-data.js';
import {
  process,
  deleteFromDataByIdsTableV2,
  calculateAge,
} from './common.js';

export async function getPeoples(options) {
  return process(allPeople, options || {});
}

export async function addPerson(data) {
  const findDuplicateName = allPeople.findIndex((person) => person.name === data.name);
  if (findDuplicateName >= 0) {
    throw new CustomError({
      name: 'This name already exists',
    });
  }
  const newData = {
    id: faker.datatype.uuid(),
    name: data.name,
    age: calculateAge(new Date(data.date)),
    married: data.married,
    birthDate: new Date(data.date),
  };
  allPeople.push(newData);
  return newData.id;
}

export async function changePerson(changedData) {
  const itemIndex = allPeople.findIndex((animal) => animal.id === changedData.id);
  // eslint-disable-next-line no-param-reassign
  allPeople[itemIndex] = {
    id: changedData.id,
    name: changedData.name,
    age: calculateAge(new Date(changedData.date)),
    married: changedData.married,
    birthDate: new Date(changedData.date),
  };
  return changedData.id;
}

export async function deletePeople(ids) {
  return deleteFromDataByIdsTableV2(allPeople, ids, 'id');
}
