import jwt from 'jsonwebtoken';
import { getUserIsActiveById } from '../services/auth.js';

export default async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { id } = jwt.verify(token, process.env.TOKEN_SECRET);

    const isActive = await getUserIsActiveById(id);

    if (isActive === null || isActive === false) {
      throw new Error('Invalid User');
    }

    next();
  } catch (e) {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
}
