const express = require("express");
const cors = require("cors");
const jsonEndpoints = require("./jsonEndpoints");
const dbEndpoints = require("./dbEndpoints");
const {
  testConnection,
  createTable,
  populateTable,
  db,
} = require("./databaseSetup");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

const initializeDatabase = async () => {
  try {
    await testConnection();
    await createTable();
    await populateTable();
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1); // Exit if critical error
  }
};

initializeDatabase();

app.use("/api/videos", jsonEndpoints);
app.use("/api/", dbEndpoints(db));

const server = app.listen(port, () => {
  const { address, port } = server.address();
  const host = address === "::" ? "localhost" : address;
  console.log(`Server is running at http://${host}:${port}`);
});
