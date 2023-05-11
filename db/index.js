const { Client } = require('pg');


const connectionString = process.env.DATABASE_URL || 'postgres://scott@localhost:5432/juicebox-dev';
const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database!');
  })
  .catch((error) => {
    console.error('Error connecting to PostgreSQL:', error);
  });

  async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username 
      FROM users;
    `);
    return rows;
  }
  async function createUser({ username, password }) {
    try {
      const {rows} = await client.query(` INSERT INTO users(username, password)
      VALUES ($1, $2);
    `, [username, password]);
  
      
  
      return rows
    } catch (error) {
      throw error;
    }
  }
  

module.exports = {
  client,
  getAllUsers,
  createUser,
};






