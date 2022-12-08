import Client from 'pg';

const { Pool, types } = Client;

// NUMERIC(10,2) -> float
types.setTypeParser(1700, (val) => parseFloat(val));

export default new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my-table',
  password: 'gfhjkm36',
  port: 5433,
});
