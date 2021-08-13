const express = require("express");
const validator = require("validator");
const User = require("../Schema/userSchema");
const Followers = require("../Schema/followersSchema");
const Authenticate = require("../middleware/authenticate");

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { name, userName, email, password, cpassword } = req.body;
    if (!name || !userName || !email || !password || !cpassword) {
      return res
        .status(422)
        .json({ error: "Please fill fields properly", status: 422 });
    }

    if (validator.isEmail(email)) {
      const useremail = await User.findOne({ email });
      const username = await User.findOne({ userName });
      if (useremail) {
        return res.status(422).json({ error: "Email already exists" });
      } else if (username) {
        return res.status(422).json({ error: "Username already exists" });
      } else if (password == cpassword) {
        const user = new User({ name, userName, email, password });
        await user
          .save()
          .then(async (response) => {
            const follower = new Followers({ userId: response._id });
            await follower
              .save()
              .then()
              .catch((err) => console.log(err));
            return res.status(201).json(response);
          })
          .catch((err) => console.log(err));
      } else {
        return res
          .status(422)
          .json({ error: "Password not same", status: 422 });
      }
    } else {
      return res.status(422).json({ error: "Invalid email", status: 422 });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Can't register. Try again" });
  }
});

authRouter.post("/signin", async (req, res) => {
  try {
    const { user, password } = req.body;
    if (!user || !password) {
      return res
        .status(422)
        .json({ error: "Please fill fields properly", status: 422 });
    }

    const userResponse = await User.findOne({
      $or: [{ userName: user }, { email: user }],
    });
    if (userResponse) {
      await userResponse.comparePassword(
        password,
        async function (err, isMatch) {
          if (err) throw err;
          else {
            if (isMatch) {
              const token = await userResponse.generateAuthToken();
              return res.status(201).json({
                message: "Logged In",
                status: 201,
                token: token,
                user: {
                  userId: userResponse._id,
                  name: userResponse.name,
                  userName: userResponse.userName,
                  email: userResponse.email,
                  profileImg: userResponse.profileImg,
                  discription: userResponse.discription,
                  token: userResponse.token,
                },
              });
            } else {
              return res
                .status(422)
                .json({ error: "Invalid credentials", status: 422 });
            }
          }
        }
      );
    } else {
      res.status(422).json({ error: "Invalid credentials", status: 422 });
    }
  } catch (err) {
    console.log(err);
  }
});

authRouter.get("/homepage", Authenticate, (req, res) => {
  try {
    return res.status(201).json({
      message: "Logged In",
      status: 201,
      user: {
        userId: req.rootUser._id,
        name: req.rootUser.name,
        userName: req.rootUser.userName,
        email: req.rootUser.email,
        profileImg: req.rootUser.profileImg,
        discription: req.rootUser.discription,
        token: req.rootUser.token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Can't fetch data" });
  }
});

authRouter.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findOne({ _id: userId })
      .then((response) => {
        return res.status(201).json({
          status: 201,
          user: {
            userId: response._id,
            name: response.name,
            userName: response.userName,
            profileImg: response.profileImg,
            discription: response.discription,
            email: response.email,
          },
        });
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

authRouter.get("/getUser/:id", async (req, res) => {
  try {
    const value = req.params.id;
    await User.find({
      $or: [
        { userName: { $regex: value, $options: "i" } },
        { name: { $regex: value, $options: "i" } },
      ],
    })
      .limit(10)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json({ error: "Can't fetch data" });
      });
  } catch (error) {
    console.log(error);
  }
});

authRouter.post("/getUserData", async (req, res) => {
  try {
    const data = req.body.data;
    await User.find(
      { _id: { $in: data } },
      { userName: 1, name: 1, profileImg: 1 }
    )
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).json("Error fetching data");
      });
  } catch (error) {
    console.log(error);
    return res.status(401).json("Error fetching data");
  }
});

authRouter.get("/userImg/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    await User.findById({ _id }, { profileImg: 1 })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        return res.status(401).json("Error fetching img");
      });
  } catch (error) {
    return res.status(401).json("Error fetching img");
  }
});

module.exports = authRouter;
