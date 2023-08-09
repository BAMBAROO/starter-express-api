import "dotenv/config";
import express from "express";
import Server from "socket.io";
import cookieParser from "cookie-parser";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import User from "./model/Users.js";
import router from "./routes/router.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.END_POINT,
    methods: ["GET", "POST"],
  },
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    credentials: true,
    origin: process.env.END_POINT,
  })
);

app.use(router);

function visitors() {
  const client = io.sockets.clients().connected;
  const socket = Object.values(client);
  const users = socket.map((s) => s.user);
  return users;
}

function emitVisitors() {
  const users = visitors().filter((data) => data !== undefined);
  if (users.length != 0) {
    io.emit("visitors", users);
  }
}

io.on("connection", (socket) => {
  socket.on("new_visitor", (arg) => {
    if (arg !== undefined) {
      socket.user = arg;
      emitVisitors();
    }
  });

  socket.on("message", (dari, ke, pesan) => {
    socket.broadcast.emit(ke, pesan, dari);
  });

  socket.on("disconnect", () => {
    emitVisitors();
  });
});

mongoose
  .connect(process.env.MONGO_URI, { dbName: "user_account" })
  .then(async () => {
    console.log("berhasil terkoneksi ke database");
    server.listen(8000, () => {
      console.log("running at port 8000");
    });
  })
  .catch((error) => {
    console.log(error);
  });
