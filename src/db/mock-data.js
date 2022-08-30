import { faker } from '@faker-js/faker';

const generatePeople = (size) => new Array(size).fill(0).map(() => ({
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  age: faker.datatype.number({ min: 1, max: 100 }),
  married: Math.random() < 0.5,
  birthDate: faker.date.past(100, '2020-01-01T00:00:00.000Z'),
}));

export const allPeople = generatePeople(23);

const generateAnimal = (size) => new Array(size).fill(0).map(() => ({
  idKey: faker.datatype.uuid(),
  dogName: faker.name.findName(),
  age: faker.datatype.number({ min: 1, max: 20 }),
  height: Math.random() * (10 - 1) + 1,
  birthDate: faker.date.past(20, '2020-01-01T00:00:00.000Z'),
  owner: allPeople[faker.datatype.number({ min: 0, max: allPeople.length - 1 })],
}));

export const allAnimals = generateAnimal(22);
