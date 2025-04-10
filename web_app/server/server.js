const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Storage path for tools data
const TOOLS_FILE = path.join(__dirname, 'data', 'tools.json');

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
// Get all tools
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await loadTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tools' });
  }
});

// Get a single tool
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
    
    res.status(200).json({ message: 'Tool deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete tool' });
  }
});

// Start server
app.listen(PORT, async () => {
  await ensureDataDir();
  console.log(`Server running on port ${PORT}`);
});
