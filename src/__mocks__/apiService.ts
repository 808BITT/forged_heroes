
export interface Category {
  id: string;
  name: string;
}


// Mock implementation of toolsApi
const toolsApi = {
  getAll: jest.fn().mockResolvedValue({}),
  getById: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  testTool: jest.fn().mockResolvedValue({}),
  parseFunctionSignature: jest.fn().mockResolvedValue({}),
  generateDescription: jest.fn().mockResolvedValue(''),
  getCategories: jest.fn().mockResolvedValue([]),
  createCategory: jest.fn().mockResolvedValue({}),
  deleteCategory: jest.fn().mockResolvedValue({}),
};

export default toolsApi;