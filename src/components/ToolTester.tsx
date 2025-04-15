import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Define types for the component props and state
interface ToolTesterProps {
  toolSpec: any;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

interface ValidationError {
  keyword: string;
  dataPath: string;
  schemaPath: string;
  params: any;
  message: string;
}

interface TestResult {
  success: boolean;
  message: string;
  validationErrors?: ValidationError[];
  result?: any;
}

export const ToolTester = ({ toolSpec, buttonVariant = "outline", className = "" }: ToolTesterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Update initializeInputValues to handle missing or invalid toolSpec structure
  const initializeInputValues = () => {
    if (!toolSpec || !toolSpec.function || !toolSpec.function.parameters || !toolSpec.function.parameters.properties) {
      return {};
    }

    const initialValues: Record<string, any> = {};
    for (const [key, prop] of Object.entries<any>(toolSpec.function.parameters.properties)) {
      if (prop.default !== undefined) {
        initialValues[key] = prop.default;
      } else {
        switch (prop.type) {
          case 'string':
            initialValues[key] = '';
            break;
          case 'number':
            initialValues[key] = 0;
            break;
          case 'boolean':
            initialValues[key] = false;
            break;
          case 'array':
            initialValues[key] = [];
            break;
          case 'object':
            initialValues[key] = {};
            break;
          default:
            initialValues[key] = null;
        }
      }
    }
    return initialValues;
  };

  // Reset and open the dialog
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setInputValues(initializeInputValues());
      setTestResult(null);
    }
    setIsOpen(open);
  };

  // Handle input changes
  const handleInputChange = (key: string, value: any) => {
    setInputValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Test the tool with the current input values
  const handleTestTool = async () => {
    if (!toolSpec) return;
    
    setIsTesting(true);
    try {
      const response = await fetch('/api/test-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolSpec,
          testInput: inputValues,
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing tool:', error);
      setTestResult({
        success: false,
        message: `Error connecting to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Update renderInputField to handle more specific parameter types
  const renderInputField = (key: string, param: any) => {
    switch (param.type) {
      case 'string':
        if (param.enum && Array.isArray(param.enum)) {
          return (
            <select
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              value={inputValues[key] || param.default || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            >
              <option value="">Select a value</option>
              {param.enum.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }
        
        // Handle string formats
        if (param.format === 'date-time') {
          return (
            <input
              type="datetime-local"
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              value={inputValues[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          );
        } else if (param.format === 'date') {
          return (
            <input
              type="date"
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              value={inputValues[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          );
        } else if (param.format === 'email') {
          return (
            <input
              type="email"
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              value={inputValues[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          );
        } else if (param.format === 'uri') {
          return (
            <input
              type="url"
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              value={inputValues[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          );
        }
        
        return (
          <input
            type="text"
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            value={inputValues[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        );

      case 'integer':
        return (
          <input
            type="number"
            step="1"
            min={param.minimum !== undefined ? param.minimum : undefined}
            max={param.maximum !== undefined ? param.maximum : undefined}
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            value={inputValues[key] || 0}
            onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step="any"
            min={param.minimum !== undefined ? param.minimum : undefined}
            max={param.maximum !== undefined ? param.maximum : undefined}
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            value={inputValues[key] || 0}
            onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
          />
        );

      case 'boolean':
        return (
          <select
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            value={inputValues[key] ? 'true' : 'false'}
            onChange={(e) => handleInputChange(key, e.target.value === 'true')}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case 'array':
        let arrayItemsType = 'string';
        if (param.items && param.items.type) {
          arrayItemsType = param.items.type;
        }
        
        let jsonValue = '';
        try {
          jsonValue = JSON.stringify(inputValues[key] || [], null, 2);
        } catch (error) {
          jsonValue = '[]';
        }
        
        return (
          <div className="space-y-1">
            <textarea
              aria-label={param.description || key} // Ensure accessibility
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 font-mono text-sm"
              rows={4}
              value={jsonValue}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange(key, Array.isArray(parsed) ? parsed : []);
                } catch (error) {
                  // Ignore invalid JSON
                }
              }}
              placeholder={`Enter JSON array of ${arrayItemsType} values`}
            />
            <div className="text-xs text-muted-foreground">
              Array items should be of type: <span className="font-semibold">{arrayItemsType}</span>
            </div>
          </div>
        );

      case 'object':
        let objectValue = '';
        try {
          objectValue = JSON.stringify(inputValues[key] || {}, null, 2);
        } catch (error) {
          objectValue = '{}';
        }
        
        return (
          <textarea
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 font-mono text-sm"
            rows={5}
            value={objectValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(key, typeof parsed === 'object' ? parsed : {});
              } catch (error) {
                // Ignore invalid JSON
              }
            }}
            placeholder="Enter JSON object"
          />
        );

      default:
        return (
          <input
            type="text"
            aria-label={param.description || key} // Ensure accessibility
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            value={inputValues[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        );
    }
  };

  // Render the test result UI
  const renderTestResult = () => {
    if (!testResult) return null;

    return (
      <div className="mt-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium flex items-center">
          {testResult.success ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-500">Test Successful</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-500">Test Failed</span>
            </>
          )}
        </h3>
        
        <p className="mt-1 text-sm">{testResult.message}</p>
        
        {testResult.validationErrors && (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Validation Errors:</h4>
            <ul className="mt-1 text-sm text-red-500 list-disc list-inside">
              {testResult.validationErrors.map((error, idx) => (
                <li key={idx}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {testResult.success && testResult.result && (
          <div className="mt-2">
            <h4 className="text-sm font-medium">Mock Result:</h4>
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto text-xs">
              {JSON.stringify(testResult.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  if (!toolSpec) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={className}>
          Test Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test Tool: {toolSpec.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="mt-1 text-sm text-muted-foreground">{toolSpec.description}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium">Input Parameters</h3>
          
          {toolSpec?.function && (
            <>
              <div className="grid w-full gap-2">
                {toolSpec.function.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{toolSpec.function.description}</p>
                  </div>
                )}
              </div>
              <div className="grid w-full items-center gap-4">
                {toolSpec.function.parameters && toolSpec.function.parameters.properties ? (
                  <>
                    {Object.entries<any>(toolSpec.function.parameters.properties).map(([key, param]) => {
                      const isRequired = toolSpec.function.parameters.required?.includes(key);
                      return (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="block text-sm font-medium">
                              {key}
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <span className="text-xs text-muted-foreground block mt-1">
                              {param.description || `Type: ${param.type}`}
                            </span>
                          </div>
                          <div className="col-span-2">
                            {renderInputField(key, param)}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No parameters defined</p>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleTestTool} 
            disabled={isTesting}
            className="relative"
          >
            {isTesting ? 'Testing...' : 'Test Tool'}
          </Button>
        </div>
        
        {renderTestResult()}
      </DialogContent>
    </Dialog>
  );
};

export default ToolTester;
