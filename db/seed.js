const { client } = require('./index');

async function testDB() {
  try {
    const result = await client.query('SELECT * FROM users;');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

testDB();


