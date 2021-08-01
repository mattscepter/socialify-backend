const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    commentId: {
      type: String,
    },
    title: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    imgPath: {
      type: String,
      default: "",
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
