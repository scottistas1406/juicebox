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
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        authorid INTEGER REFERENCES users(id) NOT NULL,
        title varchar(255) NOT NULL,
        content varchar(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) UNIQUE NOT NULL  
      );  
    `);

    await client.query(`
      CREATE TABLE post_tags (
        id SERIAL PRIMARY KEY,
        postid INTEGER REFERENCES posts(id),
        tagId INTEGER REFERENCES tags(id)
      );
       
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

// Create data in tables section
async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Albert Two', location: 'Here' });
    const sandra = await createUser({ username: 'sandra', password: 'imposter_albert', name: 'Sandra', location: 'Here' });
    const glamgal = await createUser({ username: 'glamgal', password: 'imposter_albert', name: 'Glam Gal', location: 'Here' });

    console.log(albert);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    console.log("Starting to create posts...");

    const [albert, sandra, glamgal] = await getAllUsers();

    const post1 = await createPost({
      authorID: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
      tags: [{ name: '#happy' }, { name: '#youcandoanything' }]
    });

    const post2 = await createPost({
      authorID: sandra.id,
      title: "Second Post",
      content: "This is my second post. Writing blogs is my passion!",
      tags: [{ name: '#worst-day-ever' }, { name: '#youcandoanything' }]
    });

    const post3 = await createPost({
      authorID: glamgal.id,
      title: "Third Post",
      content: "This is my third post. I'm excited to share my thoughts with you all.",
      tags: [{ name: '#happy' }, { name: '#catmandoeverything' }, { name: '#youcandoanything' }]
    });

    console.log("Finished creating posts!");
  } catch (error) {
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

    const posts = await getAllPosts(); // Retrieve all posts

    await Promise.all(
      posts.map((post) => {
        if (post.title === "First Post") {
          return addTagsToPost(post.id, [happy, inspo]);
        }
        if (post.title === "Second Post") {
          return addTagsToPost(post.id, [sad, inspo]);
        }
        if (post.title === "Third Post") {
          return addTagsToPost(post.id, [happy, catman, inspo]);
        }
      })
    );

    console.log("Finished creating tags!");
  } catch (error) {
    console.log("Error creating tags!");
    throw error;
  }
}

async function rebuildDB() {
  try {
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

    console.log("Calling updateUser on posts[0]");

    const updateUserResult = await updateUser(posts[0].authorid, {
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
