export const metaDataAboutTables = {
  animal: {
    tableId: 'idKey',
    columnsTypes: {
      dogName: 'string',
      age: 'number',
      birthDate: 'date',
      height: 'number',
    },
    references: {
      owner: { columnReference: 'ownerId', tableReference: 'people' },
    },
  },
  people: {
    tableId: 'id',
    columnsTypes: {
      name: 'string',
      age: 'number',
      married: 'boolean',
      birthDate: 'date',
      weight: 'number',
    },
  },
};

export default metaDataAboutTables;
