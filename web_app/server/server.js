const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs').promises;
const path = require('path');
const validateToolSpec = require('./validation/toolSchema');
const Ajv = require('ajv');

// Initialize express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Forged Heroes API',
      version: '0.0.1',
      description: 'API documentation for Forged Heroes',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [__filename], // Use JSDoc comments in this file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Update SQLite database initialization to use a file-based database
const DB_PATH = path.join(__dirname, 'data', 'tools.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`Connected to SQLite database at ${DB_PATH}`);
    db.run(`CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      parameters TEXT,
      status TEXT,
      lastModified TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating tools table:', err);
      }
    });
  }
});

const TOOLS_FILE = path.join(__dirname, 'tools.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(TOOLS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error('Error ensuring data directory:', error);
  }
}

// Updated loadTools function to fetch from SQLite database
async function loadTools() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tools', [], (err, rows) => {
      if (err) {
        console.error('Error loading tools from database:', err);
        reject(err);
      } else {
        const tools = rows.reduce((acc, row) => {
          acc[row.id] = {
            ...row,
            parameters: JSON.parse(row.parameters),
          };
          return acc;
        }, {});
        // console.log('Loaded tools from database:', tools); // Log loaded tools
        resolve(tools);
      }
    });
  });
}

// Helper to save a tool to the database
async function saveTool(tool) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO tools (id, name, description, category, parameters, status, lastModified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tool.id,
        tool.name,
        tool.description,
        tool.category,
        JSON.stringify(tool.parameters),
        tool.status,
        tool.lastModified,
      ],
      (err) => {
        if (err) {
          console.error('Error saving tool:', err);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

// Helper to delete a tool from the database
async function deleteTool(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM tools WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting tool:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// API Routes
/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Retrieve all tools
 *     responses:
 *       200:
 *         description: A list of tools
 */
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await loadTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tools' });
  }
});

/**
 * @swagger
 * /api/tools/{id}:
 *   get:
 *     summary: Retrieve a single tool by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tool ID
 *     responses:
 *       200:
 *         description: A single tool
 *       404:
 *         description: Tool not found
 */
app.get('/api/tools/:id', async (req, res) => {
  try {
    const tools = await loadTools();
    const tool = tools[req.params.id];
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tool' });
  }
});

// Create a new tool
app.post('/api/tools', async (req, res) => {
  try {
    const isValid = validateToolSpec(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid tool specification', errors: validateToolSpec.errors });
    }

    const id = uuidv4();
    const newTool = {
      ...req.body,
      id,
      lastModified: new Date().toISOString()
    };

    await saveTool(newTool);

    res.status(201).json(newTool);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tool' });
  }
});

// Update a tool
app.put('/api/tools/:id', async (req, res) => {
  try {
    const isValid = validateToolSpec(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid tool specification', errors: validateToolSpec.errors });
    }

    const { id } = req.params;
    const tools = await loadTools();

    if (!tools[id]) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const updatedTool = {
      ...tools[id],
      ...req.body,
      id,
      lastModified: new Date().toISOString()
    };

    await saveTool(updatedTool);
    res.json(updatedTool);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tool' });
  }
});

// Delete a tool
app.delete('/api/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tools = await loadTools();
    
    if (!tools[id]) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    await deleteTool(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete tool' });
  }
});

// New route to parse function signature
app.post('/api/parseFunctionSignature', async (req, res) => {
  try {
    const { signature } = req.body;
    const parsedData = parseFunctionSignature(signature);
    res.json(parsedData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to parse function signature' });
  }
});

// New route to generate description using light LLM
app.post('/api/generateDescription', async (req, res) => {
  try {
    const { signature } = req.body;
    const description = await generateDescription(signature);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate description' });
  }
});

/**
 * @swagger
 * /api/test-tool:
 *   post:
 *     summary: Test a tool specification with sample input
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toolSpec:
 *                 type: object
 *               testInput:
 *                 type: object
 *     responses:
 *       200:
 *         description: Test results
 *       400:
 *         description: Invalid request or validation error
 */
app.post('/api/test-tool', (req, res) => {
  try {
    const { toolSpec, testInput } = req.body;

    if (!toolSpec || !testInput) {
      return res.status(400).json({
        success: false,
        message: 'Both toolSpec and testInput are required',
      });
    }

    // Validate toolSpec structure
    const isValidToolSpec = validateToolSpec(toolSpec);
    if (!isValidToolSpec) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tool specification',
        validationErrors: validateToolSpec.errors,
      });
    }

    // Validate testInput against toolSpec parameters
    const inputSchema = {
      type: 'object',
      properties: toolSpec.function.parameters.properties,
      required: toolSpec.function.parameters.required || [],
    };

    const ajv = new Ajv();
    const validateInput = ajv.compile(inputSchema);
    const isValidInput = validateInput(testInput);

    if (!isValidInput) {
      return res.json({
        success: false,
        validationErrors: validateInput.errors,
        message: 'Input validation failed',
      });
    }

    // Generate mock result
    const mockResult = generateMockResult(toolSpec.function.returns);

    return res.json({
      success: true,
      message: 'Input validation successful',
      result: mockResult,
    });
  } catch (error) {
    console.error('Error testing tool:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing tool',
      error: error.message,
    });
  }
});

// Helper function to generate mock results based on the return schema
function generateMockResult(returnSchema) {
  const result = {};
  
  if (returnSchema && returnSchema.properties) {
    for (const [key, prop] of Object.entries(returnSchema.properties)) {
      switch (prop.type) {
        case 'string':
          result[key] = `Sample ${key}`;
          break;
        case 'number':
          result[key] = 123;
          break;
        case 'boolean':
          result[key] = true;
          break;
        case 'array':
          result[key] = [];
          break;
        case 'object':
          result[key] = {};
          break;
        default:
          result[key] = null;
      }
    }
  }
  
  return result;
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
