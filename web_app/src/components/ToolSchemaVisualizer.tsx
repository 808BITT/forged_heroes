import { Tree, TreeNode } from 'react-organizational-chart';
import { useToolStore } from '../store/toolStore';

export default function ToolSchemaVisualizer() {
    const tools = useToolStore((state) => state.getAllTools());

    interface Tool {
        name: string;
        parameters: Parameter[];
    }

    interface Parameter {
        id: string;
        name: string;
        type: string;
        description?: string;
        required?: boolean;
    }

    const renderTree = (tool: Tool) => (
        <TreeNode label={tool.name}>
            {tool.parameters.map((param: Parameter) => (
                <TreeNode key={param.id} label={`${param.name} (${param.type})`}>
                    {param.description && <TreeNode label={`Description: ${param.description}`} />}
                    {param.required && <TreeNode label="Required" />}
                </TreeNode>
            ))}
        </TreeNode>
    );

    return (
        <div className="tool-schema-visualizer">
            <h2>Tool Specification Schema</h2>
            {tools.length > 0 ? (
                <Tree label="Tools">
                    {tools.map((tool) => renderTree(tool))}
                </Tree>
            ) : (
                <p>No tools available to visualize.</p>
            )}
        </div>
    );
}