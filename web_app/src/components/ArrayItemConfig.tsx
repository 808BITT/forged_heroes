import { Label } from "./ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";

interface ArrayItemConfigProps {
  itemType: string;
  itemDescription: string;
  itemProperties?: any;
  onUpdate: (config: { 
    itemType: string; 
    itemDescription: string; 
    itemProperties?: any;
  }) => void;
}

const ITEM_TYPES = ["string", "number", "integer", "boolean", "object"];

export function ArrayItemConfig({ 
  itemType,
  itemDescription,
  itemProperties,
  onUpdate 
}: ArrayItemConfigProps) {
  const [type, setType] = useState(itemType || "string");
  const [description, setDescription] = useState(itemDescription || "");
  const [objectSchema, setObjectSchema] = useState(
    itemProperties && type === "object" 
      ? JSON.stringify(itemProperties, null, 2) 
      : "{}"
  );

  useEffect(() => {
    let properties = undefined;
    
    if (type === "object") {
      try {
        properties = JSON.parse(objectSchema);
      } catch (error) {
        properties = {};
      }
    }
    
    onUpdate({
      itemType: type,
      itemDescription: description,
      itemProperties: properties
    });
  }, [type, description, objectSchema, onUpdate]);

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h4 className="text-sm font-medium">Array Item Configuration</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="item-type">Item Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="item-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="item-description">Item Description</Label>
          <Textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the items in this array"
            rows={1}
          />
        </div>
      </div>
      
      {type === "object" && (
        <div className="space-y-2">
          <Label htmlFor="object-schema">Object Schema (JSON)</Label>
          <Textarea
            id="object-schema"
            value={objectSchema}
            onChange={(e) => setObjectSchema(e.target.value)}
            placeholder='{ "type": "object", "properties": {...} }'
            rows={5}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Define the schema for object items in JSON format
          </p>
        </div>
      )}
    </div>
  );
}

export default ArrayItemConfig;
