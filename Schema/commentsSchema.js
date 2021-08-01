const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  comment: [
    {
      type: new mongoose.Schema(
        {
          userName: {
            type: String,
            required: true,
          },
          userId: {
            type: String,
            required: true,
          },
          comment: {
            type: String,
          },
        },
        { timestamps: true }
      ),
    },
  ],
});

module.exports = mongoose.model("comment", commentsSchema);
