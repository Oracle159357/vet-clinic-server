import * as peopleDb from '../db/people.js';
import CustomError from '../errors/custom-error.js';

export const getPeoples = (options) => peopleDb.selectPeople(options);

export const addPerson = async (person) => {
  if (await peopleDb.existsByName(person.name)) {
    throw new CustomError({
      name: 'This name already exists',
    });
  }

  return peopleDb.insertPerson(person);
};

export const changePerson = async (changedPerson) => {
  if (await peopleDb.existsByName(changedPerson.name)) {
    throw new CustomError({
      name: 'This name already exists',
    });
  }

  return peopleDb.updatePerson(changedPerson);
};

export const removePeople = (ids) => peopleDb.deletePeople(ids);
