import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (e) {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
}
