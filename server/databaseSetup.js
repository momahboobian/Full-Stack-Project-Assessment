const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const exampleResponse = [
  {
    id: 523523,
    title: "Never Gonna Give You Up",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    rating: 23,
  },
  {
    id: 523427,
    title: "The Coding Train",
    url: "https://www.youtube.com/watch?v=HerCR8bw_GE",
    rating: 230,
  },
  {
    id: 82653,
    title: "Mac & Cheese | Basics with Babish",
    url: "https://www.youtube.com/watch?v=FUeyrEN14Rk",
    rating: 2111,
  },
  {
    id: 858566,
    title: "Videos for Cats to Watch - 8 Hour Bird Bonanza",
    url: "https://www.youtube.com/watch?v=xbs7FT7dXYc",
    rating: 11,
  },
  {
    id: 453538,
    title:
      "The Complete London 2012 Opening Ceremony | London 2012 Olympic Games",
    url: "https://www.youtube.com/watch?v=4As0e4de-rI",
    rating: 3211,
  },
  {
    id: 283634,
    title: "Learn Unity - Beginner's Game Development Course",
    url: "https://www.youtube.com/watch?v=gB1F9G0JXOo",
    rating: 211,
  },
  {
    id: 562824,
    title: "Cracking Enigma in 2021 - Computerphile",
    url: "https://www.youtube.com/watch?v=RzWB5jL5RX0",
    rating: 111,
  },
  {
    id: 442452,
    title: "Coding Adventure: Chess AI",
    url: "https://www.youtube.com/watch?v=U4ogK0MIzqk",
    rating: 671,
  },
  {
    id: 536363,
    title: "Coding Adventure: Ant and Slime Simulations",
    url: "https://www.youtube.com/watch?v=X-iSQQgOd1A",
    rating: 76,
  },
  {
    id: 323445,
    title: "Why the Tour de France is so brutal",
    url: "https://www.youtube.com/watch?v=ZacOS8NBK6U",
    rating: 73,
  },
];

const db = new Pool({
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
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
  for (const video of exampleResponse) {
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
