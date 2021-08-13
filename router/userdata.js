const express = require("express");
const multer = require("multer");
const User = require("../Schema/userSchema");
const Conversation = require("../Schema/conversationSchema");
var fs = require("fs");

const userDataRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profilepic");
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

userDataRouter.post("/userdata", upload, async (req, res) => {
  try {
    const { discription, userId } = req.body;
    if (req.file) {
      const profileImg = req.file.filename;
      await User.updateOne({ _id: userId }, { discription, profileImg })
        .then((response) => res.status(201).json("Updated"))
        .catch((err) => res.status(401).json("Unable to add user data"));
    } else {
      await User.updateOne({ _id: userId }, { discription })
        .then((response) => res.status(201).json("Updated"))
        .catch((err) => res.status(401).json("Unable to add user data"));
    }
  } catch (error) {
    res.status(401).json("Unable to add user data");
  }
});

userDataRouter.patch("/userdata", upload, async (req, res) => {
  try {
    const { discription, userId, updateImg, profilePic } = req.body;
    if (req.file) {
      const profileImg = req.file.filename;
      await fs.unlink(
        `./uploads/profilepic/${profilePic}`,
        function (err, res) {}
      );
      await User.updateOne({ _id: userId }, { discription, profileImg })
        .then(async (response) => {
          res.status(201).json("Updated");
        })
        .catch((err) => res.status(401).json("Unable to add user data"));
    } else if (updateImg) {
      await fs.unlink(
        `./uploads/profilepic/${profilePic}`,
        function (err, res) {}
      );
      await User.updateOne({ _id: userId }, { discription, profileImg: "" })
        .then((response) => res.status(201).json("Updated"))
        .catch((err) => res.status(401).json("Unable to add user data"));
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = userDataRouter;
