import postgres from 'postgres';

// TODO: ADD env sample
const sql = postgres({
  port: +(process.env.DB_PORT || 5432),
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: +(process.env.DB_MAX_CONNECTIONS || 10),
  idle_timeout: +(process.env.DB_IDLE_TIMEOUT || 30),
  connect_timeout: +(process.env.DB_CONNECT_TIMEOUT || 15),
  timeout: +(process.env.DB_QUERY_TIMEOUT || 60000),
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
  debug: process.env.NODE_ENV === 'development',
});

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create numbers table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS numbers (
        id SERIAL PRIMARY KEY,
        value INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create grades table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        class VARCHAR(50) NOT NULL,
        grade INTEGER NOT NULL CHECK (grade >= 0 AND grade <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

export default sql;
