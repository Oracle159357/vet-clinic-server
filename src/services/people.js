import * as peopleDb from '../db/people.js';

export const getPeoples = (options) => peopleDb.selectPeople(options);

export const addPerson = (person) => peopleDb.insertPerson(person);

export const changePerson = (changedPerson) => peopleDb.updatePerson(changedPerson);

export const removePeople = (ids) => peopleDb.deletePeople(ids);
