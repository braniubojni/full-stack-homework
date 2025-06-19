import postgres from 'postgres';

// Connection configuration
const sql = postgres({
  port: +(process.env.DB_PORT || 5432),
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
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
