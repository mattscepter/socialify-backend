const { response } = require("express");
const express = require("express");
const Comment = require("../Schema/commentsSchema");

const commentRouter = express.Router();

commentRouter.post("/addcomment", async (req, res) => {
  try {
    const { userId, postId, userName, comment } = req.body;
    if (!userId || !postId || !comment || !userName) {
      return res.status(401).json({ error: "Invalid Comment" });
    }
    await Comment.updateOne(
      { postId },
      { $push: { comment: { userId, comment, userName } } }
    )
      .then((response) => {
        return res.status(201).json("Posted");
      })
      .catch((err) => {
        return res.status(401).json({ error: "Can't add comment" });
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Can't add comment" });
  }
});

commentRouter.get("/getcomment/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    await Comment.findOne({ postId })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        return res.status(401).json({ error: "Can't fetch comments" });
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Can't fetch comment" });
  }
});

module.exports = commentRouter;
