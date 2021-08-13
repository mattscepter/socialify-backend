const express = require("express");
const multer = require("multer");
const Post = require("../Schema/postSchema");
const Followers = require("../Schema/followersSchema");
const Comment = require("../Schema/commentsSchema");
var fs = require("fs");

const postRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/posts");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("imageData");

postRouter.post("/addpost", upload, async (req, res) => {
  try {
    const { title, caption, userId, userName, profileImg } = req.body;
    console.log(req.body);
    if (req.file) {
      const imgPath = req.file.filename;
      const post = new Post({
        title,
        caption,
        userId,
        imgPath,
        userName,
        profileImg,
      });
      await post
        .save()
        .then(async (res) => {
          const comment = new Comment({ postId: res._id });
          await comment
            .save()
            .then()
            .catch((err) => {
              return res.status(401).json({ error: "Can't add post1" });
            });
        })
        .catch((err) => {
          return res.status(401).json({ error: "Can't add post2", err });
        });
    } else {
      if (!title && !caption) {
        return res.status(422).json({ error: "Fill atleast one field" });
      }
      const post = new Post({ title, caption, userId, userName, profileImg });
      await post
        .save()
        .then(async (response) => {
          const comment = new Comment({ postId: response._id });
          await comment
            .save()
            .then()
            .catch((err) => {
              return res.status(401).json({ error: "Can't add post3" });
            });
        })
        .catch((err) => {
          return res.status(401).json({ error: "Can't add post4" });
        });
    }
    return res.status(201).json("Posted");
  } catch (err) {
    return res.status(401).json({ error: "Can't add post5" });
  }
});

postRouter.get("/getpost/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Post.find({ userId })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Error fetching data" });
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Error fetching data" });
  }
});

postRouter.get("/getposts/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Followers.findOne({ userId }, { following: 1 })
      .then(async (response) => {
        const userPost = await Post.find({ userId });
        const followingIds = response.following.map((f) => f);
        await Post.find({ userId: { $in: followingIds } })
          .then((respon) => {
            return res.status(200).json(userPost.concat(respon));
          })
          .catch((err) => {
            console.log(err);
            return res.status(401).json({ error: "Can't fetch data" });
          });
      })
      .catch((err) => {
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

postRouter.get("/postcount/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Post.countDocuments({ userId })
      .then((response) => {
        return res.status(200).json(response);
      })
      .catch((err) => {
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

postRouter.put("/likepost/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Disliked");
    }
  } catch (err) {
    console.log(err);
  }
});

postRouter.get("/likes/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    await Post.findById(postId, { likes: 1, _id: 0 })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

postRouter.delete("/deletepost/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    await Post.findById(postId).then(async (respon) => {
      await Post.deleteOne({ _id: postId })
        .then(async (response) => {
          await fs.unlink(
            `./uploads/posts/${respon.imgPath}`,
            function (err) {}
          );
          await Comment.deleteOne({ postId });
          return res.status(200).json("Deleted");
        })
        .catch((err) => {
          console.log(err);
          return res.status(401).json({ error: "Can't delete post" });
        });
    });
  } catch (error) {
    return res.status(401).json({ error: "Can't delete post" });
  }
});

module.exports = postRouter;
