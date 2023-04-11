import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import CustomError from './errors/custom-error.js';
import auth from './middleware/auth.js';
import { peopleController } from './controllers/people.js';
import { animalController } from './controllers/animal.js';
import { userController } from './controllers/user.js';
import { authController } from './controllers/auth.js';

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authController);
app.use('/people', auth, peopleController);
app.use('/animal', auth, animalController);
app.use('/user', auth, userController);

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
