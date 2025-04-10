package main

import (
	"os"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// TestToolEditorInputPreservation tests that input data is preserved when typing
func TestToolEditorInputPreservation(t *testing.T) {
	// Create a sample tool for testing
	tool := Tool{
		ID:          "test123",
		Name:        "Test Tool",
		Description: "Test Description",
		Category:    "Test",
		Parameters:  []Parameter{},
	}

	// Create editor model with the tool
	editor := newToolEditorModelWithTool(tool)

	// Verify initial state
	if editor.nameInput.Value() != "Test Tool" {
		t.Errorf("Initial name value incorrect. Got %q, want %q", editor.nameInput.Value(), "Test Tool")
	}

	// Simulate typing in the name field
	nameMsg := tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}}
	updatedModel, _ := editor.Update(nameMsg)
	updatedEditor := updatedModel.(toolEditorModel)

	// Verify that name value is updated correctly
	expectedName := "Test Toolq" // Original + new character
	if updatedEditor.nameInput.Value() != expectedName {
		t.Errorf("Name not updated correctly after typing. Got %q, want %q",
			updatedEditor.nameInput.Value(), expectedName)
	}

	// Verify that tool state is updated correctly
	if updatedEditor.tool.Name != expectedName {
		t.Errorf("Tool name not updated correctly. Got %q, want %q",
			updatedEditor.tool.Name, expectedName)
	}
}

// TestMainKeyHandling tests that 'q' only quits when not in an input field
func TestMainKeyHandling(t *testing.T) {
	// Create a temporary store for testing
	tempFile := "test_tools.json"
	defer os.Remove(tempFile)

	store, err := NewStore(tempFile)
	if err != nil {
		t.Fatalf("Failed to create test store: %v", err)
	}

	// Add a test tool to the store
	testTool := Tool{
		ID:          "test123",
		Name:        "Test Tool",
		Description: "Test Description",
		Category:    "Test",
		Parameters:  []Parameter{},
	}
	store.AddTool(testTool)

	// Create a direct editor for testing specific key handling
	editor := newToolEditorModelWithTool(testTool)

	// Ensure first input is focused
	editor.inputs[0].Focus()

	// Simulate typing 'q' in the input field
	qMsg := tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}}
	updatedModel, _ := editor.Update(qMsg)
	updatedEditor := updatedModel.(toolEditorModel)

	// Check that the 'q' was added to the input
	expected := testTool.Name + "q" // "Test Toolq"
	if updatedEditor.nameInput.Value() != expected {
		t.Errorf("'q' not added to input. Got %q, want %q",
			updatedEditor.nameInput.Value(), expected)
	}

	// Now test that 'q' does quit when not in an input field
	// First blur the input
	updatedEditor.inputs[0].Blur()

	// Now send 'q' key
	qMsg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}}
	_, cmd := updatedEditor.Update(qMsg)

	// Check that we got a quit command
	if cmd == nil {
		t.Error("Expected quit command when pressing 'q' outside an input field, but got nil")
	}
}

// TestToolSaving tests that a tool is correctly saved when Enter is pressed on the last input
func TestToolSaving(t *testing.T) {
	// Create a temporary store for testing
	tempFile := "test_tools_save.json"
	defer os.Remove(tempFile)

	store, err := NewStore(tempFile)
	if err != nil {
		t.Fatalf("Failed to create test store: %v", err)
	}

	// Create app model
	app := newAppModel(store)

	// Switch to editor view
	app.currentView = "editor"

	// Set up editor with new tool values
	app.toolEditor.nameInput.SetValue("New Test Tool")
	app.toolEditor.descriptionInput.SetValue("New Description")
	app.toolEditor.categoryInput.SetValue("New Category")

	// Focus the last input (category)
	app.toolEditor.focused = 2
	app.toolEditor.inputs[2].Focus()
	app.toolEditor.inputs[0].Blur()
	app.toolEditor.inputs[1].Blur()

	// Simulate pressing Enter on the last field to save
	enterMsg := tea.KeyMsg{Type: tea.KeyEnter}
	updatedModel, _ := app.Update(enterMsg)
	updatedApp := updatedModel.(appModel)

	// Check that the tool was saved
	tools := store.GetTools()

	// Verify we have a tool in the store
	if len(tools) == 0 {
		t.Error("No tools found in store after saving")
		return
	}

	// Verify the saved tool has the correct values
	found := false
	for _, tool := range tools {
		if tool.Name == "New Test Tool" {
			found = true
			if tool.Description != "New Description" {
				t.Errorf("Tool description not saved correctly. Got %q, want %q",
					tool.Description, "New Description")
			}
			if tool.Category != "New Category" {
				t.Errorf("Tool category not saved correctly. Got %q, want %q",
					tool.Category, "New Category")
			}
		}
	}

	if !found {
		t.Error("Saved tool not found in store")
	}

	// Check that we returned to the list view after saving
	if updatedApp.currentView != "list" {
		t.Errorf("Did not return to list view after saving. Current view: %s", updatedApp.currentView)
	}
}

// TestParameterManagement tests the addition, editing and removal of parameters
func TestParameterManagement(t *testing.T) {
	// Create a tool with no parameters
	tool := Tool{
		ID:           "param-test",
		Name:         "Parameter Test Tool",
		Description:  "Testing parameters",
		Category:     "Test",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}

	// Create an editor model with the tool
	editor := newToolEditorModelWithTool(tool)

	// Test adding a parameter using the internal addNewParameter method directly
	editor.addNewParameter()

	// Verify parameter was added and we're in parameter editing mode
	if len(editor.parameterInputs) == 0 {
		t.Error("No parameter inputs created after adding parameter")
	}

	if !editor.editingParameters {
		t.Error("Not in parameter editing mode after adding parameter")
	}

	// Simulate entering parameter data for the parameterInputs
	if len(editor.parameterInputs) >= 1 {
		editor.parameterInputs[0].SetValue("testParam")

		if len(editor.parameterInputs) >= 2 {
			editor.parameterInputs[1].SetValue("string")
		}

		if len(editor.parameterInputs) >= 3 {
			editor.parameterInputs[2].SetValue("Test parameter description")
		}

		if len(editor.parameterInputs) >= 4 {
			editor.parameterInputs[3].SetValue("true")
		}
	}

	// Call saveParameter directly to save the parameter
	editor.saveParameter()

	// Verify parameter was saved to the tool
	if len(editor.tool.Parameters) == 0 {
		t.Error("Parameter was not saved to the tool")
	} else {
		param := editor.tool.Parameters[0]
		if param.Name != "testParam" {
			t.Errorf("Parameter name not saved correctly. Got %q, want %q", param.Name, "testParam")
		}
		if param.Type != "string" {
			t.Errorf("Parameter type not saved correctly. Got %q, want %q", param.Type, "string")
		}
	}

	// Test deleting a parameter
	editor.selectedParamIndex = 0
	editor.deleteParameter(0)

	// Verify parameter was removed
	if len(editor.tool.Parameters) > 0 {
		t.Error("Parameter was not removed from the tool")
	}
}

// TestToolUpdate tests that a tool is correctly updated when editing an existing tool
func TestToolUpdate(t *testing.T) {
	// Create a temporary store for testing
	tempFile := "test_tools_update.json"
	defer os.Remove(tempFile)

	store, err := NewStore(tempFile)
	if err != nil {
		t.Fatalf("Failed to create test store: %v", err)
	}

	// Add a test tool to the store
	origTool := Tool{
		ID:           "update-test", // Fixed ID for testing
		Name:         "Original Name",
		Description:  "Original Description",
		Category:     "Original Category",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}

	// Explicitly add the tool to the store's map to ensure it exists with the right ID
	store.tools[origTool.ID] = origTool
	store.save()

	// Create the editor model with the original tool
	editor := newToolEditorModelWithTool(origTool)

	// Update tool fields
	editor.nameInput.SetValue("Updated Name")
	editor.descriptionInput.SetValue("Updated Description")
	editor.categoryInput.SetValue("Updated Category")

	// Get the updated tool from the editor
	updatedTool := editor.getTool()

	// Update the tool in the store directly
	err = store.UpdateTool(updatedTool)
	if err != nil {
		t.Fatalf("Failed to update tool: %v", err)
	}

	// Get the tools from the store
	tools := store.GetTools()

	// Check that the tool was updated in the store
	found := false
	for _, tool := range tools {
		if tool.ID == "update-test" {
			found = true
			if tool.Name != "Updated Name" {
				t.Errorf("Tool name not updated correctly. Got %q, want %q",
					tool.Name, "Updated Name")
			}
			if tool.Description != "Updated Description" {
				t.Errorf("Tool description not updated correctly. Got %q, want %q",
					tool.Description, "Updated Description")
			}
			if tool.Category != "Updated Category" {
				t.Errorf("Tool category not updated correctly. Got %q, want %q",
					tool.Category, "Updated Category")
			}
		}
	}

	if !found {
		t.Error("Updated tool not found in store")
	}
}
