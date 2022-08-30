export default class CustomError extends Error {
  constructor(payload) {
    super(JSON.stringify(payload));
    this.name = 'CustomError';
    this.payload = payload;
  }
}
