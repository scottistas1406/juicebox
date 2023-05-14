const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  createTags,
  addTagsToPost,
  getPostsByUser,
  getUserById,
    
} = require('./index');

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    DROP TABLE IF EXISTS tags;
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
 await client.query(`

      CREATE TABLE tags(
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) UNIQUE NOT NULL  
      );  
 `);
 await client.query(`
 CREATE TABLE post_tags (
   id SERIAL PRIMARY KEY,
   postId INTEGER REFERENCES posts(id),
   tagId INTEGER REFERENCES tags(id)
 );
`);

    

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

//create data in tables section
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
    await createPost({
      authorId: glamgal.id,
      title: "Firstasdfasdf Post",
      content: "Thissdfasdff is my first post. I hope I love writing blogs as much as I love writing them."
    });

        
    console.log("Finished creating posts!");
  } catch(error) {
    console.error("Error creating posts!");
    throw error;
  }
}


async function createInitialTags() {
  try {
    console.log("Starting to create tags...");

    const [happy, sad, inspo, catman] = await createTags([
      { name: '#happy' },
      { name: '#worst-day-ever' },
      { name: '#youcandoanything' },
      { name: '#catmandoeverything' }
    ]);

    const [postOne, postTwo, postThree] = await getAllPosts();

    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log("Finished creating tags!");
  } catch (error) {
    console.log("Error creating tags!");
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
    await createInitialTags();
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
  const posts = await getAllPosts();
  const albert = await getUserById(1);
    console.log("posts", posts);
}




rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());


