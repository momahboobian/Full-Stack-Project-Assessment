const { Pool } = require("pg");
const path = require("path");
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

const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "videos" (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      uploadDate TIMESTAMP NOT NULL,
      rating INT NOT NULL
    )`;

  await db.query(createTableQuery);
  console.log("Table 'videos' created or already exists.");
};

const populateTable = async () => {
  const jsonVideosPath = path.resolve(__dirname, "exampleResponse.json");

  let jsonVideos;
  try {
    const jsonData = fs.readFileSync(jsonVideosPath);
    jsonVideos = JSON.parse(jsonData); // Parse the JSON data
  } catch (error) {
    console.error("Error reading or parsing exampleResponse.json:", error);
    return; // Exit the function if there's an error
  }

  for (const video of jsonVideos) {
    try {
      const { rows: existingVideo } = await db.query(
        'SELECT id FROM "videos" WHERE url = $1',
        [video.url]
      );

      if (existingVideo.length === 0) {
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

const hasRecords = async () => {
  const result = await db.query("SELECT COUNT(*) FROM videos");
  return parseInt(result.rows[0].count) > 0;
};

module.exports = {
  createTable,
  populateTable,
  testConnection,
  hasRecords,
  db,
};
