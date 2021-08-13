const express = require("express");
const Conversation = require("../Schema/conversationSchema");

const conversationRouter = express.Router();

conversationRouter.post("/addConvo", async (req, res) => {
  try {
    const { sender, reciever } = req.body;
    const convo = new Conversation({ members: [sender, reciever] });
    const findConvo = await Conversation.findOne({
      $and: [
        { members: { $elemMatch: { userId: sender.userId } } },
        { members: { $elemMatch: { userId: reciever.userId } } },
      ],
    });
    if (!findConvo) {
      await convo
        .save()
        .then((response) => {
          return res.status(201).json(response);
        })
        .catch((err) => {
          return res.status(401).json("Error adding convo");
        });
    } else {
      {
        return res.status(201).json(findConvo);
      }
    }
  } catch (error) {
    return res.status(401).json("Error adding convo");
  }
});

conversationRouter.get("/getConvo/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await Conversation.find({ members: { $elemMatch: { userId } } })
      .sort({ updatedAt: -1 })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((error) => {
        return res.status(401).json("Error getting convo");
      });
  } catch (error) {
    return res.status(401).json("Error getting convo");
  }
});

conversationRouter.post("/sendMsg", async (req, res) => {
  try {
    const { _id, message } = req.body;
    await Conversation.findOneAndUpdate(
      {
        _id,
      },
      { $push: { messages: message } }
    )
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        return res.status(401).json("Error sending msg");
      });
  } catch (error) {
    return res.status(401).json("Error sending msg");
  }
});

conversationRouter.get("/getMsg/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Conversation.findOne({ _id: id })
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((err) => {
        res.status(201).json("Error fetching messages");
      });
  } catch (error) {
    res.status(201).json("Error fetching messages");
  }
});

conversationRouter.delete("/deleteConvo/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    await Conversation.findByIdAndDelete({ _id })
      .then((response) => {
        return res.status(201).json("Delete convo");
      })
      .catch((err) => {
        return res.status(401).json("Error deleting convo");
      });
  } catch (error) {
    return res.status(401).json("Error deleting convo");
  }
});

module.exports = conversationRouter;
