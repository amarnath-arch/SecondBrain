import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
import path from "path";
const __dirname = import.meta.dirname;

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
  path: envPath,
});

mongoose.connect(process.env.MONGO_DB_URL ?? "").then(function () {
  console.log("db connnected");
  app.listen(process.env.PORT, function () {
    console.log(`listening to PORT : ${process.env.PORT}`);
  });
});
