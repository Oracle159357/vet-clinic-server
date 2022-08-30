import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import CustomError from './errors/custom-error.js';
import { peopleController } from './controllers/people.js';
import { animalController } from './controllers/animal.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/people', peopleController);
app.use('/animal', animalController);

app.get('/status', (req, res) => {
  res.send('I am up and running!');
});

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(400).send(err.payload);
  } else {
    next(err);
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Test example app listening on port ${port}`);
});
