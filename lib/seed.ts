import sql from './db';

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS numbers (
      id SERIAL PRIMARY KEY,
      value INTEGER NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS grades (
      id SERIAL PRIMARY KEY,
      class VARCHAR(255) NOT NULL,
      grade INTEGER NOT NULL
    );
  `;

  console.log('Database schema created.');
  await sql.end();
}

main();
