//backend/controllers/categoryController.js
import Category from "../models/Category.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching categories" });
    }
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        const { name, monthly_limit } = req.body;

        if (!name || monthly_limit === undefined) {
            return res.status(400).json({
                success: false,
                error: "Name and monthly_limit are required",
            });
        }

        // Check if category already exists
        const exists = await Category.findOne({ name: name.trim() });
        if (exists) {
            return res.status(400).json({
                success: false,
                error: "Category with this name already exists",
            });
        }

        const category = new Category({
            name: name.trim(),
            monthly_limit: parseFloat(monthly_limit),
        });

        await category.save();

        res.status(201).json({
            success: true,
            data: category,
            message: "Category created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error creating category" });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, monthly_limit } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid category ID",
            });
        }

        // Check if new name already exists (and is different from current)
        if (name) {
            const existing = await Category.findOne({
                name: name.trim(),
                _id: { $ne: id },
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: "Category with this name already exists",
                });
            }
        }

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (monthly_limit !== undefined)
            updates.monthly_limit = parseFloat(monthly_limit);

        const category = await Category.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        res.json({
            success: true,
            data: category,
            message: "Category updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error updating category" });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid category ID",
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        res.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error deleting category" });
    }
};