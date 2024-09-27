const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const jsonFilePath = path.resolve(__dirname, "exampleResponse.json");

try {
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error("File not found: " + jsonFilePath);
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  router.get("/", async (req, res) => {
    res.json(jsonData);
  });
} catch (error) {
  console.error("Error loading JSON data:", error);
  router.get("/", async (req, res) => {
    res.status(500).json({ error: "Failed to load JSON data" });
  });
}

module.exports = router;
