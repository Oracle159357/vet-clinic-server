import _ from 'lodash';
import CustomError from '../errors/custom-error.js';

export const baseTypeOfColumn = {
  name: 'string',
  age: 'number',
  married: 'boolean',
  birthDate: 'date',
  dogName: 'string',
  height: 'number',
  'owner.name': 'string',
};

export function process(data, options) {
  const { filters, sorting, paging } = options;
  let filteredData;
  // ReactTable
  if (Array.isArray(filters)) {
    if (filters !== undefined && filters.length !== 0) {
      const allFilter = filters;
      filteredData = data.filter((el) => allFilter.every(({ value, id }) => {
        const currentValue = _.get(el, id);
        const typeOfColumn = baseTypeOfColumn[id];
        if (typeOfColumn === 'boolean') {
          const booleanLabels = { true: true, false: false };
          return value === 'null' ? true : currentValue === booleanLabels[value];
        }
        if (typeOfColumn === 'number') {
          const isFromValid = value.from === undefined
            || value.from <= currentValue;
          const isToValid = value.to === undefined
            || currentValue <= value.to;
          return isFromValid && isToValid;
        }
        if (typeOfColumn === 'string') {
          return currentValue.toLowerCase().includes(value.toLowerCase());
        }
        if (typeOfColumn === 'date') {
          const isFromValid = value.from === undefined
            || new Date(value.from) <= currentValue;
          const isToValid = value.to === undefined
            || currentValue <= new Date(value.to);

          return isFromValid && isToValid;
        }
        throw new CustomError('Not supported data type');
      }));
    } else {
      filteredData = data;
    }
    // MyCustomTable
  } else if (filters !== undefined && Object.keys(filters).length !== 0) {
    const allFilter = Object.entries(filters);
    filteredData = data.filter((el) => allFilter.every(([key, { valueFilter }]) => {
      const currentValue = el[key];
      const typeOfColumn = baseTypeOfColumn[key];
      if (typeOfColumn === 'boolean') {
        return valueFilter === null ? true : currentValue === valueFilter;
      }
      if (typeOfColumn === 'number') {
        const isFromValid = valueFilter.from === undefined
          || parseInt(valueFilter.from, 10) <= currentValue;
        const isToValid = valueFilter.to === undefined
          || currentValue <= parseInt(valueFilter.to, 10);

        return isFromValid && isToValid;
      }
      if (typeOfColumn === 'string') {
        return currentValue.toLowerCase().includes(valueFilter.toLowerCase());
      }
      if (typeOfColumn === 'date') {
        const isFromValid = valueFilter.from === undefined
          || new Date(valueFilter.from) <= currentValue;
        const isToValid = valueFilter.to === undefined
          || currentValue <= new Date(valueFilter.to);

        return isFromValid && isToValid;
      }
      throw new CustomError('Not supported data type2');
    }));
  } else {
    filteredData = data;
  }
  let sortedData;
  if (sorting !== undefined && sorting.length !== 0) {
    sortedData = _.orderBy(
      filteredData,
      sorting.map((x) => x.id),
      sorting.map((x) => (x.desc ? 'desc' : 'asc')),
    );
  } else {
    sortedData = filteredData;
  }
  let resultData;
  if (paging !== undefined) {
    resultData = sortedData.filter((item, index) => {
      const fromIndex = paging.page * paging.size;
      const toIndex = (paging.page + 1) * paging.size;
      return index >= fromIndex && index < toIndex;
    });
  } else {
    resultData = sortedData;
  }
  return { resultData, dataLength: sortedData.length };
}

export function mutationFilter(arr, cb) {
  for (let l = arr.length - 1; l >= 0; l -= 1) {
    if (!cb(arr[l])) arr.splice(l, 1);
  }
}

export function calculateAge(birthday) {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function deleteFromDataByIdsTableV2(data, ids, nameOfId) {
  mutationFilter(data, (el) => !ids.includes(el[nameOfId]));
  return ids;
}
