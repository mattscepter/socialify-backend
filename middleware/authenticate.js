const jwt = require("jsonwebtoken");
const User = require("../Schema/userSchema");

const Authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    const rootUser = await User.findOne({
      _id: verifyToken._id,
      token: token,
    });

    if (!rootUser) {
      throw new Error("User not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
};

module.exports = Authenticate;
