const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./router/auth.js");
const postRouter = require("./router/post");
const followersRouter = require("./router/followers");
const commentRouter = require("./router/comment.js");
const userDataRouter = require("./router/userdata");
const conversationRouter = require("./router/conversation.js");
const User = require("./Schema/userSchema");
const Followers = require("./Schema/followersSchema");
const http = require("http");
const RegexEscape = require("regex-escape");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => console.log("Connection Successful"))
  .catch((err) => console.log(err));

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ withCredentials: true }));
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/api", followersRouter);
app.use("/uploads", express.static("uploads"));
app.use("/comments", commentRouter);
app.use("/data", userDataRouter);
app.use("/conversation", conversationRouter);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(users);
    io.emit("getUsers", users);
  });

  socket.on("find_user", function (value) {
    if (value != "") {
      User.find(
        {
          $or: [
            { userName: { $regex: RegexEscape(value), $options: "i" } },
            { name: { $regex: RegexEscape(value), $options: "i" } },
          ],
        },
        { userName: 1, name: 1, profileImg: 1 },
        function (err, user) {
          if (err) throw err;
          if (!user) socket.emit("find_user_result", {});
          else socket.emit("find_user_result", user);
        }
      ).limit(15);
    }
  });

  socket.on(
    "sendMessage",
    ({ conversationId, senderId, recieverId, message }) => {
      const user = getUser(recieverId);
      try {
        io.to(user.socketId).emit("getMessage", {
          conversationId,
          senderId,
          message,
        });
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.get("/", (req, res) => {
  res.send("Hello welcome to my socialify server");
});

server.listen(port, () => {
  console.log(`listening to port ${port}`);
});
