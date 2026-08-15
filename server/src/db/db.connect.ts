import { drizzle } from 'drizzle-orm/node-postgres';


// specific way to constuct the connection string
export const db = drizzle({ 
  connection: { 
    connectionString: process.env.DATABASE_URL
  }
});
 
// test to ensure that the database is running
export async function testDatabaseConnection() {
  try {
    await db.execute('select 1');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}