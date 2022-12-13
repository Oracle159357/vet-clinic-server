import bcrypt from 'bcryptjs';

export async function encryptPassword(password) {
  const salt = await bcrypt.genSalt();

  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
