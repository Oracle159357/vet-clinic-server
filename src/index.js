import { faker } from '@faker-js/faker';
import cors from 'cors';
import _ from 'lodash';
import express from 'express';
import bodyParser from "body-parser";
const app = express();
const port = 3000;

const generateData1 = (size) => new Array(size).fill(0).map(() => ({
  id: faker.datatype.uuid(),
  name: faker.name.findName(),
  age: faker.datatype.number({ min: 1, max: 100 }),
  married: Math.random() < 0.5,
  birthDate: faker.date.past(100, '2020-01-01T00:00:00.000Z'),
}));
const data1 = generateData1(23);
function process(data, options) {
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
        throw new Error('Not supported data type');
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
      throw new Error('Not supported data type2');
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
  const result = { resultData, dataLength: sortedData.length };
  return JSON.parse(JSON.stringify(result));
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/misha', (req, res) => {
  const options = req.body;
  const result = process(data1, options || {});
  res.send(
    {
      dataLength: result.dataLength,
      data: result.resultData,
    }
  )
  console.log(req.body)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
