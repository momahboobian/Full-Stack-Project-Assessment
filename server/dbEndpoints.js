const express = require("express");
const router = express.Router();

const dbEndpoints = (db) => {
  router.get("/", async (req, res) => {
    try {
      const { rows: dbVideos } = await db.query(
        "SELECT * FROM videos ORDER BY id ASC"
      );
      res.json(dbVideos);
    } catch (error) {
      console.error("Error fetching videos from the database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/", async (req, res) => {
    const { title, url } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ error: "Video title and URL are required" });
    }

    try {
      const { rows } = await db.query(
        "INSERT INTO videos (title, url, uploadDate, rating) VALUES ($1, $2, CURRENT_TIMESTAMP, 0) RETURNING id",
        [title, url]
      );

      res.status(201).json({ id: rows[0].id });
    } catch (error) {
      console.error("Error adding video:", error);
      res.status(500).json({ error: "Failed to add video" });
    }
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
      await db.query("DELETE FROM videos WHERE id = $1", [id]);
      res.status(204).send(); // No content
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  router.post("/:videoId/rating", async (req, res) => {
    const videoId = req.params.videoId;
    const { like, dislike } = req.body;

    try {
      const updateQueries = [];
      if (like)
        updateQueries.push(
          `UPDATE videos SET rating = rating + 1 WHERE id = $1`
        );
      if (dislike)
        updateQueries.push(
          `UPDATE videos SET rating = rating - 1 WHERE id = $1`
        );

      if (updateQueries.length) {
        await db.query(updateQueries.join("; "), [videoId]);
      }

      res.status(200).json({ message: "Rating updated successfully" });
    } catch (error) {
      console.error("Error updating rating:", error);
      res.status(500).json({ error: "Failed to update rating" });
    }
  });

  return router;
};

module.exports = dbEndpoints;
