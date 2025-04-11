package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"
)

// Store handles all data operations
type Store struct {
	filePath string
	tools    map[string]Tool
}

// NewStore creates a new store with the given file path
func NewStore(filePath string) (*Store, error) {
	store := &Store{
		filePath: filePath,
		tools:    make(map[string]Tool),
	}

	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	// Load existing data if available
	if err := store.load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}

	return store, nil
}

// Updated AddTool to initialize parameters
func (s *Store) AddTool(tool Tool) {
	tool.ID = generateID()
	tool.LastModified = time.Now()
	if tool.Parameters == nil {
		tool.Parameters = []Parameter{}
	}
	s.tools[tool.ID] = tool
	s.save()
}

// Updated UpdateTool to ensure parameters are preserved
func (s *Store) UpdateTool(tool Tool) error {
	if existingTool, exists := s.tools[tool.ID]; exists {
		if tool.Parameters == nil {
			tool.Parameters = existingTool.Parameters
		}
	} else {
		return errors.New("tool not found")
	}

	tool.LastModified = time.Now()
	s.tools[tool.ID] = tool
	s.save()
	return nil
}

// DeleteTool removes a tool from the store
func (s *Store) DeleteTool(id string) error {
	if _, exists := s.tools[id]; !exists {
		return errors.New("tool not found")
	}

	delete(s.tools, id)
	s.save()
	return nil
}

// GetTools returns all tools in the store
func (s *Store) GetTools() []Tool {
	tools := make([]Tool, 0, len(s.tools))
	for _, tool := range s.tools {
		tools = append(tools, tool)
	}
	return tools
}

// load reads tools from the JSON file
func (s *Store) load() error {
	file, err := os.Open(s.filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewDecoder(file).Decode(&s.tools)
}

// save writes tools to the JSON file
func (s *Store) save() error {
	file, err := os.Create(s.filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewEncoder(file).Encode(s.tools)
}

// generateID generates a unique ID for a tool
func generateID() string {
	return time.Now().Format("20060102150405")
}
