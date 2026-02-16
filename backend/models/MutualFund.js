//backend/models/MutualFund.js
import mongoose from "mongoose";

const mutualFundSchema = new mongoose.Schema(
    {
        fund_name: {
            type: String,
            required: true,
            trim: true,
        },
        scheme_code: {
            type: String,
            required: true,
            trim: true,
        },
        invested_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        units: {
            type: Number,
            required: true,
            min: 0,
        },
        current_nav: {
            type: Number,
            default: 0,
        },
        purchase_date: {
            type: Date,
            default: Date.now,
        },
        expected_value: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Virtual for current value
mutualFundSchema.virtual("current_value").get(function () {
    return this.units * this.current_nav;
});

// Virtual for gain
mutualFundSchema.virtual("gain").get(function () {
    return this.current_value - this.invested_amount;
});

// Virtual for return percentage
mutualFundSchema.virtual("return_percentage").get(function () {
    if (this.invested_amount === 0) return 0;
    return ((this.gain / this.invested_amount) * 100).toFixed(2);
});

// Ensure virtuals are included in JSON
mutualFundSchema.set("toJSON", { virtuals: true });
mutualFundSchema.set("toObject", { virtuals: true });

export default mongoose.model("MutualFund", mutualFundSchema);