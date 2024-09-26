const { Pool } = require("pg");
const fs = require("fs");

require("dotenv").config();

const db = new Pool({
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  ssl: {
    rejectUnauthorized: false,
  },
});

const testConnection = async () => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0].now);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

// Function to create the "videos" table if it doesn't exist
const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "videos" (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      uploadDate TIMESTAMP NOT NULL,
      rating INT NOT NULL
    )`;

  try {
    const result = await db.query(createTableQuery);
    console.log("Table 'videos' created or already exists.");
    return result;
  } catch (err) {
    console.error("Error creating the 'videos' table:", err);
    throw err;
  }
};

// Function to populate the table from videos
const populateTable = async () => {
  const jsonFilePath = "./exampleResponse.json";
  const jsonVideos = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  for (const video of jsonVideos) {
    try {
      const existingVideo = await db.query(
        'SELECT id FROM "videos" WHERE url = $1',
        [video.url]
      );

      if (existingVideo.rows.length === 0) {
        await db.query(
          'INSERT INTO "videos" (title, url, uploadDate, rating) VALUES ($1, $2, $3, $4)',
          [video.title, video.url, new Date(), video.rating]
        );
        console.log(`Inserted video: ${video.title}`);
      } else {
        console.log(`Video already exists: ${video.title}`);
      }
    } catch (error) {
      console.error("Error inserting video into the database:", error);
      throw error;
    }
  }

  console.log("Populated 'videos' table from exampleResponse.json");
};

// Function to check if there are any records in the "videos" table
const hasRecords = async () => {
  try {
    const result = await db.query("SELECT COUNT(*) FROM videos");
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error("Error checking for records in 'videos' table:", error);
    throw error;
  }
};

module.exports = {
  createTable,
  populateTable,
  testConnection,
  hasRecords,
  db,
};
