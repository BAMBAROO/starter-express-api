import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 2,
    max: 50
  },
  email: {
    type: String,
    required: true,
    max: 100,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 50
  },
  refrehToken: {
    type: String,
    default: ''
  },
});

const User = new mongoose.model("User", UserSchema);

export default User;