const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    members: [
      {
        type: new mongoose.Schema({
          userId: {
            type: String,
            required: true,
          },
          userName: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
        }),
      },
    ],
    messages: [
      {
        type: new mongoose.Schema(
          {
            sender: {
              type: String,
              required: true,
            },
            message: {
              type: String,
              default: "",
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", conversationSchema);
