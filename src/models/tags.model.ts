import { Schema } from "mongoose";
import mongoose from "mongoose";

const tagsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
});

const tagsModel = mongoose.model("Tags", tagsSchema);
export default tagsModel;
