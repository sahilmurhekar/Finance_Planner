//backend/models/UserProfile.js
import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: null,
        },
        designation: {
            type: String,
            default: null,
        },
        monthly_salary: {
            type: Number,
            default: null,
        },
        allocations: {
            crypto: {
                type: Number,
                default: 0,
            },
            mf: {
                type: Number,
                default: 0,
            },
            expenses: {
                type: Number,
                default: 0,
            },
        },
        currency: {
            type: String,
            enum: ["INR", "USD", "EUR"],
            default: "INR",
        },
    },
    { timestamps: true }
);

// Get or create single user profile
userProfileSchema.statics.getProfile = async function () {
    let profile = await this.findOne();
    if (!profile) {
        profile = await this.create({});
    }
    return profile;
};

export default mongoose.model("UserProfile", userProfileSchema);