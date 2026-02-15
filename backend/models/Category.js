//backend/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        monthly_limit: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Category", categorySchema);