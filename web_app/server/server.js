const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

// Storage path for tools data
const TOOLS_FILE = path.join(__dirname, '..', '..', 'data', 'tools.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch (err) {
    await fs.mkdir(dataDir, { recursive: true });
    // Create an empty tools file
    await fs.writeFile(TOOLS_FILE, '{}');
  }
}

// Helper to load tools from file
async function loadTools() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(TOOLS_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error('Error loading tools:', error);
    return {};
  }
}

// Helper to save tools to file
async function saveTools(tools) {
  await ensureDataDir();
  await fs.writeFile(TOOLS_FILE, JSON.stringify(tools, null, 2));
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
    const tools = await loadTools();
    const id = uuidv4();
    const newTool = {
      ...req.body,
      id,
      lastModified: new Date().toISOString()
    };
    
    tools[id] = newTool;
    await saveTools(tools);
    
    res.status(201).json(newTool);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tool' });
  }
});

// Update a tool
app.put('/api/tools/:id', async (req, res) => {
  try {
    const tools = await loadTools();
    const { id } = req.params;
    
    if (!tools[id]) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    tools[id] = {
      ...tools[id],
      ...req.body,
      id,
      lastModified: new Date().toISOString()
    };
    
    await saveTools(tools);
    res.json(tools[id]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tool' });
  }
});

// Delete a tool
app.delete('/api/tools/:id', async (req, res) => {
  try {
    const tools = await loadTools();
    const { id } = req.params;
    
    if (!tools[id]) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    delete tools[id];
    await saveTools(tools);
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

// Start server
app.listen(PORT, async () => {
  await ensureDataDir();
  console.log(`Server running on port ${PORT}`);
});
