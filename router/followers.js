const express = require("express");
const Followers = require("../Schema/followersSchema");

const followersRouter = express.Router();

followersRouter.post("/follow", async (req, res) => {
  try {
    const { userId, followerId } = req.body;
    await Followers.updateOne(
      { userId },
      { $addToSet: { requested: followerId } }
    )
      .then(async (response) => {
        await Followers.updateOne(
          { userId: followerId },
          { $addToSet: { requests: userId } }
        )
          .then((respon) => {
            return res.status(201).json("Requested");
          })
          .catch((err) => {
            console.log(err);
            return res.status(401).json({ error: "Error sending request" });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Error sending request" });
      });
  } catch (err) {
    return res.status(401).json({ error: "Error sending request" });
  }
});

followersRouter.get("/follower/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Followers.findOne({ userId })
      .then((response) => {
        return res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

followersRouter.post("/unfollow", async (req, res) => {
  try {
    const { userId, followerId } = req.body;
    await Followers.updateOne({ userId }, { $pull: { following: followerId } })
      .then(async (response) => {
        await Followers.updateOne(
          { userId: followerId },
          { $pull: { followers: userId } }
        )
          .then((respon) => {
            return res.status(201).json("Successful");
          })
          .catch((err) => {
            console.log(err);
            return res
              .status(401)
              .json({ error: "Error unfollowing the user" });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Error unfollowing the user" });
      });
  } catch (err) {
    return res.status(401).json({ error: "Error unfollowing the user" });
  }
});

followersRouter.get("/followings/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Followers.findOne({ userId }, { following: 1 })
      .then((response) => {
        return res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

followersRouter.get("/followers/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Followers.findOne({ userId }, { followers: 1 })
      .then((response) => {
        return res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

followersRouter.put("/acceptrequest", async (req, res) => {
  try {
    const { userId, followerId } = req.body;
    await Followers.updateOne(
      { userId },
      { $pull: { requests: followerId }, $addToSet: { followers: followerId } }
    )
      .then(async (response) => {
        await Followers.updateOne(
          { userId: followerId },
          { $pull: { requested: userId }, $addToSet: { following: userId } }
        )
          .then((respon) => {
            return res.status(201).json("Successful");
          })
          .catch((err) => {
            console.log(err);
            return res.status(401).json({ error: "Error accepting request" });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Error accepting request" });
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Error accepting request" });
  }
});

followersRouter.put("/declinerequest", async (req, res) => {
  try {
    const { userId, followerId } = req.body;
    await Followers.updateOne({ userId }, { $pull: { requests: followerId } })
      .then(async (response) => {
        await Followers.updateOne(
          { userId: followerId },
          { $pull: { requested: userId } }
        )
          .then((respon) => {
            return res.status(201).json("Successful");
          })
          .catch((err) => {
            console.log(err);
            return res.status(401).json({ error: "Error declining request" });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Error declining request" });
      });
  } catch (error) {}
});

module.exports = followersRouter;
