import jwt from 'jsonwebtoken';
import { getUserIsActiveById, getUserIsAdminById } from '../services/auth.js';

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { id } = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = id;

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

export async function isAdmin(req, res, next) {
  const isAdmin = await getUserIsAdminById(req.userId);

  if (isAdmin === null || isAdmin === false) {
    res.status(403).json({
      error: new Error('Unauthorized request!'),
    });
  } else {
    next();
  }
}
