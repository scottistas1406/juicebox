const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  updatePost,
  getAllPosts,
  createPost,
  
} = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
    DROP TABLE IF EXISTS posts;  
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
    const sandra = await createUser({ username: 'sandra', password: 'imposter_albert',name:'albertTwo',location:'here' });
    const glamgal = await createUser({ username: 'glamgal', password: 'imposter_albert',name:'albertTwo',location:'here' });

    console.log(albert);

    console.log("Finished creating usrers!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}
async function createInitialPosts() {
  try {
    console.log("Starting to create posts...");
    const [albert, sandra, glamgal] = await getAllUsers();
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });
    await createPost({
      authorId: sandra.id,
      title: "Firstasdfasdf Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });


    
    console.log("Finished creating posts!");
  } catch(error) {
    console.error("Error creating posts!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    //await client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    const posts = await getAllPosts();
    console.log("getAllUsers:", users);
    console.log("getAllPosts:", posts);
    console.log("Result:", users);
    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, MO"
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


