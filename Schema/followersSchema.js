const mongoose = require("mongoose");

const followersSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  requests: {
    type: Array,
    default: [],
  },
  requested: {
    type: Array,
    default: [],
  },
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("follower", followersSchema);
