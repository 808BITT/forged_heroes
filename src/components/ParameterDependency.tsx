import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Parameter } from "../store/toolStore";
import { Plus, Trash } from "lucide-react";

interface ParameterDependencyProps {
  parameter: Parameter;
  allParameters: Parameter[];
  onUpdate: (dependencies: any) => void;
}

type Condition = {
  id: string;
  paramId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
};

export function ParameterDependency({ parameter, allParameters, onUpdate }: ParameterDependencyProps) {
  const [conditions, setConditions] = useState<Condition[]>(
    parameter.dependencies?.conditions || []
  );
  const [effect, setEffect] = useState<'required' | 'visible' | 'hidden'>(
    parameter.dependencies?.effect || 'required'
  );

  // Exclude current parameter from dependency options
  const availableParameters = allParameters.filter(p => p.id !== parameter.id);

  const addCondition = () => {
    const newCondition: Condition = {
      id: `c${Date.now()}`,
      paramId: availableParameters.length > 0 ? availableParameters[0].id : '',
      operator: 'equals',
      value: '',
    };
    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    updateDependency(updatedConditions, effect);
  };

  const removeCondition = (id: string) => {
    const updatedConditions = conditions.filter(c => c.id !== id);
    setConditions(updatedConditions);
    updateDependency(updatedConditions, effect);
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    const updatedConditions = conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setConditions(updatedConditions);
    updateDependency(updatedConditions, effect);
  };

  const updateEffect = (newEffect: 'required' | 'visible' | 'hidden') => {
    setEffect(newEffect);
    updateDependency(conditions, newEffect);
  };

  const updateDependency = (updatedConditions: Condition[], updatedEffect: string) => {
    if (updatedConditions.length === 0) {
      onUpdate(null); // No conditions means no dependency
    } else {
      onUpdate({
        conditions: updatedConditions,
        effect: updatedEffect,
      });
    }
  };

  const getOperatorOptions = (paramId: string) => {
    const param = allParameters.find(p => p.id === paramId);
    if (!param) return ['equals', 'not_equals'];

    switch (param.type) {
      case 'number':
      case 'integer':
        return ['equals', 'not_equals', 'greater_than', 'less_than'];
      case 'string':
        return ['equals', 'not_equals', 'contains'];
      case 'boolean':
        return ['equals', 'not_equals'];
      default:
        return ['equals', 'not_equals'];
    }
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      'equals': 'Equals',
      'not_equals': 'Not Equals',
      'contains': 'Contains',
      'greater_than': 'Greater Than',
      'less_than': 'Less Than',
    };
    return labels[operator] || operator;
  };

  const getValueInput = (condition: Condition) => {
    const param = allParameters.find(p => p.id === condition.paramId);
    if (!param) return null;

    switch (param.type) {
      case 'boolean':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(condition.id, 'value', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type={param.type === 'number' || param.type === 'integer' ? 'number' : 'text'}
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
            placeholder="Value"
          />
        );
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Parameter Dependencies</h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addCondition}
          disabled={availableParameters.length === 0}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Condition
        </Button>
      </div>

      {conditions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dependencies defined</p>
      ) : (
        <>
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Select
                    value={condition.paramId}
                    onValueChange={(value) => updateCondition(condition.id, 'paramId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParameters.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name || 'Unnamed parameter'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(
                      condition.id, 
                      'operator', 
                      value as 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorOptions(condition.paramId).map((op) => (
                        <SelectItem key={op} value={op}>
                          {getOperatorLabel(op)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4">
                  {getValueInput(condition)}
                </div>

                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Label className="block mb-2">When conditions are met:</Label>
            <Select
              value={effect}
              onValueChange={(value) => updateEffect(value as 'required' | 'visible' | 'hidden')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="required">Parameter becomes required</SelectItem>
                <SelectItem value="visible">Parameter becomes visible</SelectItem>
                <SelectItem value="hidden">Parameter becomes hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

export default ParameterDependency;
