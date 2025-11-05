import { Schema, model } from "mongoose";

const linkSchema = new Schema({
  hash: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const linkModel = model("Links", linkSchema);
