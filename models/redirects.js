import mongoose from "mongoose";
import { object_blueprint } from "../modules.js";

const Schema = mongoose.Schema;
const redirectSchema = new Schema(object_blueprint, { timestamps: true });

const Redirect = mongoose.model("Redirect", redirectSchema);
export { Redirect };