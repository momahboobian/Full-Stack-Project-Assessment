const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const jsonFilePath = path.resolve(__dirname, "exampleResponse.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

router.get("/", async (req, res) => {
  try {
    res.json(jsonData);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
