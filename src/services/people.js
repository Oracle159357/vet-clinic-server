import * as peopleDb from '../db/people.js';
import CustomError from '../errors/custom-error.js';

export const getPeoples = (options) => peopleDb.selectPeople(options);

export const addPerson = async (person) => {
  const allIdByName = await peopleDb.getPeoplesIdsByName(person.name);

  if (allIdByName.length > 0) {
    throw new CustomError({
      name: 'This name already exists',
    });
  }

  return peopleDb.insertPerson(person);
};

export const changePerson = async (changedPerson) => {
  const allIdByName = await peopleDb.getPeoplesIdsByName(changedPerson.name);
  const filterAllId = allIdByName.filter((id) => id !== changedPerson.id);

  if (filterAllId.length > 0) {
    throw new CustomError({
      name: 'This name already exists',
    });
  }

  return peopleDb.updatePerson(changedPerson);
};

export const getPeopleByIds = (ids) => peopleDb.selectPeopleByIds(ids);

export const removePeople = (ids) => peopleDb.deletePeople(ids);
