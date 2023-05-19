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
  async function getUserById(userId) {
    try {
      const {
        rows: [user],
      } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${userId}
      `);
  
      if (!user) {
        return null;
      }
  
      user.posts = await getPostsByUser(userId);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function getAllPosts() {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM posts;
    `);

    //const posts = await Promise.all(
    //  postIds.map((post) => getPostById(post.id))
   // );

    return rows
  } catch (error) {
    throw error;
  }
}
  async function createPost({
    authorId,
    title,
    content,
    tags=[]
  }) {
    try {
      const {rows} = await client.query(` INSERT INTO posts("authorID", title, content)
      VALUES ($1, $2, $3)
      RETURNING*;
      `,[authorId,title,content]);
      const tagList = await createTags(tags);
      //return rows
      
      return await addTagsToPost(post.id, tagList);
  
    } catch (error) {
      throw error;
    }
  }
  
  async function tags() {
    const { rows } = await client.query(
      `SELECT id, name
      FROM tags;
      `);
    return rows;
  }
  async function post_tags() {
    const { rows } = await client.query(
      `SELECT id, 
      FROM tags;
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

  async function createTags(tagList) {
    if (tagList.length === 0) {
      return;
    }
    const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  
    const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  
    try {
      await client.query(
        `
          INSERT INTO tags (name)
          VALUES (${insertValues})
          ON CONFLICT (name) DO NOTHING;
        `,
        tagList
      );
  
      const { rows } = await client.query(
        `
        SELECT * FROM tags 
          WHERE name IN (${selectValues})
          
        `,
        tagList
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  async function createPostTag(postId, tagId) {
    try {
      await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
      `, [postId, tagId]);
      console.log('running createposttage')
    } catch (error) {
      throw error;
    }
  }
  async function getPostsByUser(userId) {
    try {
      const { rows: postIds } = await client.query(`
        SELECT id 
        FROM posts 
        WHERE "authorId"=${userId};
      `);
  
      const posts = await Promise.all(
        postIds.map((post) => getPostById(post.id))
      );
  
      return posts;
    } catch (error) {
      throw error;
    }
  }
  async function getPostById(postId) {
    try {
     
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags.postId=$1;
      `, [postId]);
      
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  }
  async function getUserByUsername(username) {
    try {
      const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1;
      `, [username]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  


  //**updates */
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
  async function updatePost(id, fields = {}) {
    const { authorID, ...otherFields } = fields;
  
    const setString = Object.keys(otherFields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [post] } = await client.query(
        `
        UPDATE posts
        SET ${setString}
        WHERE id=$${Object.keys(otherFields).length + 1}
        RETURNING *;
        `,
        [...Object.values(otherFields), id]
      );
  
      return post;
    } catch (error) {
      throw error;
    }
  }
  async function addTagsToPost(postId, tagList) {
    try {
      const createPostTagPromises = tagList.map(
        tag => createPostTag(postId, tag.id)
      );
  
      await Promise.all(createPostTagPromises);
  
      return await getPostById(postId);
    } catch (error) {
      throw error;
    }
  }

  async function getAllTags()
   {
    const { rows } = await client.query(
      `SELECT *
      FROM tags;
      `);
    return rows;
  }
 
  
  
  

  

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  updatePost,
  getAllPosts,
  createPost,
  createTags,
  addTagsToPost,
  tags,
  post_tags,
  getPostById,
  getUserById,
  getPostsByUser,
  getAllTags,
  getUserByUsername

};






