const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  
} = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);
    await client.query(`
    CREATE TABLE POSTS (
      id SERIAL PRIMARY KEY,
      "authorID" INTEGER REFERENCES users(id) NOT NULL,
      title varchar(255) NOT NULL,
      content varchar(255) NOT NULL,
      active BOOLEAN DEFAULT true
    );
  `);
    

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}
async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99',name:'albertTwo',location:'here' });
    const albertTwo = await createUser({ username: 'albert2', password: 'imposter_albert',name:'albertTwo',location:'here' });
    const albertThree = await createUser({ username: 'albert3', password: 'imposter_albert',name:'albertTwo',location:'here' });

    console.log(albert);

    console.log("Finished creating users!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    //await client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    console.log("getAllUsers:", users);
    console.log("Result:", users);
    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());


