import { Schema } from "mongoose";
import mongoose from "mongoose";

const contentType = ["document", "tweet", "youtube", "link"];

const contentSchema = new Schema({
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: contentType,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Tags",
    },
  ],
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const contentModel = mongoose.model("Content", contentSchema);
export default contentModel;
