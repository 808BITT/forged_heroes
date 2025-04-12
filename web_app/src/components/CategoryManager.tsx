import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CategoryManagerProps {
    categories: { id: string; name: string }[];
    isLoading: boolean;
    error: string;
    onAddCategory: (name: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, isLoading, error, onAddCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [formError, setFormError] = useState("");

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            setFormError("Category name is required");
            return;
        }

        onAddCategory(newCategoryName.trim());
        setNewCategoryName("");
        setFormError("");
        setIsModalOpen(false);
    };

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                Add Category
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a new category for organizing tools.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">Category Name</Label>
                            <Input
                                id="new-category-name"
                                placeholder="Enter category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className={formError ? "border-red-500" : ""}
                            />
                            {formError && <p className="text-sm text-red-500">{formError}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCategory} disabled={isLoading || !newCategoryName.trim()}>
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <ul className="mt-4 space-y-2">
                {categories.map((category) => (
                    <li key={category.id} className="text-sm">
                        {category.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryManager;