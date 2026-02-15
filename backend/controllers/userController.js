//backend/controllers/userController.js
import UserProfile from "../models/UserProfile.js";

export const getProfile = async (req, res) => {
    try {
        const profile = await UserProfile.getProfile();
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, designation, monthly_salary, allocations, currency } = req.body;

        // Validate allocations sum to monthly_salary
        if (allocations && monthly_salary) {
            const total = allocations.crypto + allocations.mf + allocations.expenses;
            if (total !== Number(monthly_salary)) {
                return res.status(400).json({
                    message: `Allocations must sum to monthly salary (${monthly_salary}). Current total: ${total}`,
                    total,
                });
            }
        }

        const profile = await UserProfile.getProfile();

        if (name !== undefined) profile.name = name;
        if (designation !== undefined) profile.designation = designation;
        if (monthly_salary !== undefined) profile.monthly_salary = monthly_salary;
        if (allocations) profile.allocations = allocations;
        if (currency) profile.currency = currency;

        await profile.save();

        res.json({
            message: "Profile updated",
            profile,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};