//backend/models/CryptoHolding.js
import mongoose from "mongoose";

const cryptoHoldingSchema = new mongoose.Schema(
    {
        token_symbol: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        token_name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        invested_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        network: {
            type: String,
            enum: ["Ethereum", "BSC", "Polygon", "Other"],
            default: "Ethereum",
        },
        wallet_address: {
            type: String,
            trim: true,
            default: "",
        },
        purchase_date: {
            type: Date,
            default: Date.now,
        },
        current_price: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Virtual for current value
cryptoHoldingSchema.virtual("current_value").get(function () {
    return this.quantity * this.current_price;
});

// Virtual for gain
cryptoHoldingSchema.virtual("gain").get(function () {
    return this.current_value - this.invested_amount;
});

// Virtual for return percentage
cryptoHoldingSchema.virtual("return_percentage").get(function () {
    if (this.invested_amount === 0) return 0;
    return ((this.gain / this.invested_amount) * 100).toFixed(2);
});

// Average buy price
cryptoHoldingSchema.virtual("avg_buy_price").get(function () {
    if (this.quantity === 0) return 0;
    return this.invested_amount / this.quantity;
});

// Ensure virtuals are included in JSON
cryptoHoldingSchema.set("toJSON", { virtuals: true });
cryptoHoldingSchema.set("toObject", { virtuals: true });

export default mongoose.model("CryptoHolding", cryptoHoldingSchema);