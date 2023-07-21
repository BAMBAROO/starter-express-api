import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header ? header.split(" ")[1] : null;
  console.log({ token });
  if (token === null) {
    return res.status(404).json({ message: "no access token" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) {
      return res.status(403).json({ message: "token is not accessible" });
    }
    if (result) {
      req.body.email = result.email;
      req.body.name = result.name;
    }
    next();
  });
};

export default verifyToken;
