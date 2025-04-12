import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ArrayItemConfigProps {
  itemType: string;
  itemDescription: string;
  itemProperties?: Record<string, any>;
  onUpdate: (config: { itemType: string; itemDescription: string; itemProperties?: Record<string, any> }) => void;
}

const ArrayItemConfig: React.FC<ArrayItemConfigProps> = ({
  itemType,
  itemDescription,
  itemProperties,
  onUpdate,
}) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ itemType: e.target.value, itemDescription, itemProperties });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ itemType, itemDescription: e.target.value, itemProperties });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="array-item-type">Array Item Type</Label>
        <Input
          id="array-item-type"
          value={itemType}
          onChange={handleTypeChange}
          placeholder="e.g., string, object"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="array-item-description">Array Item Description</Label>
        <Input
          id="array-item-description"
          value={itemDescription}
          onChange={handleDescriptionChange}
          placeholder="Describe the array item"
        />
      </div>

      {/* Additional fields for object properties can be added here if needed */}
    </div>
  );
};

export default ArrayItemConfig;
export type { ArrayItemConfigProps };

