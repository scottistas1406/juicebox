const { Client } = require('pg');

// Supply the db name and location of the database
const connectionString = process.env.DATABASE_URL || 'postgres://scott@localhost:5432/juicebox-dev';
const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database!');
  })
  .catch((error) => {
    console.error('Error connecting to PostgreSQL:', error);
  });

module.exports = {
  client,
};






