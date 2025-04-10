package main

import (
	"os"
	"testing"
	"time"
)

// TestToolListDisplay tests that tools are properly displayed after being added or updated
func TestToolListDisplay(t *testing.T) {
	// Create a temporary store for testing
	tempFile := "test_tools_list.json"
	defer os.Remove(tempFile)

	store, err := NewStore(tempFile)
	if err != nil {
		t.Fatalf("Failed to create test store: %v", err)
	}

	// Add a test tool directly to the store's map to ensure it exists
	tool1 := Tool{
		ID:           "test-tool-1",
		Name:         "Test Tool 1",
		Description:  "Test Description 1",
		Category:     "Test",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}
	store.tools[tool1.ID] = tool1
	store.save()

	// Create a tool list with the tool
	toolList := newToolListModel(store.GetTools())

	// Check that the tool list has the tool
	if len(toolList.tools) != 1 {
		t.Errorf("Expected 1 tool in list, got %d", len(toolList.tools))
	}

	// Check that the list items match the number of tools
	if len(toolList.list.Items()) != len(toolList.tools) {
		t.Errorf("Number of list items (%d) doesn't match number of tools (%d)",
			len(toolList.list.Items()), len(toolList.tools))
	}

	// Add another tool directly to the store's map
	tool2 := Tool{
		ID:           "test-tool-2",
		Name:         "Test Tool 2",
		Description:  "Test Description 2",
		Category:     "Test",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}
	store.tools[tool2.ID] = tool2
	store.save()

	// Create a new tool list with the updated tools
	updatedToolList := newToolListModel(store.GetTools())

	// Check that the updated tool list has both tools
	if len(updatedToolList.tools) != 2 {
		t.Errorf("Expected 2 tools in updated list, got %d", len(updatedToolList.tools))
		for _, tool := range updatedToolList.tools {
			t.Logf("Tool in list: %s (%s)", tool.Name, tool.ID)
		}
	}

	// Check that the list items match the number of tools
	if len(updatedToolList.list.Items()) != len(updatedToolList.tools) {
		t.Errorf("Number of list items (%d) doesn't match number of tools (%d)",
			len(updatedToolList.list.Items()), len(updatedToolList.tools))
	}
}
