import bcrypt from 'bcryptjs';

export default async function encryptPassword(password) {
  const salt = await bcrypt.genSalt();

  return bcrypt.hash(password, salt);
}
