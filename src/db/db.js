import Client from 'pg';

const { Pool } = Client;

export default new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'my-table',
  password: 'gfhjkm36',
  port: 5433,
});
