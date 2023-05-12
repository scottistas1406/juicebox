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
      `SELECT id, username , location, active
      FROM users;
    `);
    return rows;
  }
  async function createUser({
    username,
    password,
    name,
    location
   }) {
    try {
      const {rows} = await client.query(` INSERT INTO users(username, password, name, location)
      VALUES ($1, $2, $3,$4)
      ON CONFLICT (username) DO NOTHING
      RETURNING*;
    `, [username, password,name,location]);
  
      
  
      return rows
    } catch (error) {
      throw error;
    }
  }
  async function updateUser(id, fields = {}) {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [user] } = await client.query(
        `
        UPDATE users
        SET ${setString}
        WHERE id=$${Object.keys(fields).length + 1}
        RETURNING *;
        `,
        [...Object.values(fields), id]
      );
  
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  

  

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
};






