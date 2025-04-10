package main

import (
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// TestDirectParameterEditing tests parameter editing by directly calling editor methods
func TestDirectParameterEditing(t *testing.T) {
	// Create a sample tool for testing
	tool := Tool{
		ID:           "param-edit-test",
		Name:         "Parameter Editor Test",
		Description:  "Testing parameter editing",
		Category:     "Test",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}

	// Create editor model with the tool
	editor := newToolEditorModelWithTool(tool)

	// Verify initial state - no parameters
	if len(editor.tool.Parameters) != 0 {
		t.Errorf("Expected 0 initial parameters, got %d", len(editor.tool.Parameters))
	}

	// 1. Test adding a parameter
	editor.addNewParameter()

	// Verify parameter was added
	if len(editor.tool.Parameters) != 1 {
		t.Errorf("Expected 1 parameter after adding, got %d", len(editor.tool.Parameters))
	}

	// Verify we're in parameter editing mode
	if !editor.editingParameters {
		t.Error("Not in parameter editing mode after adding parameter")
	}

	// 2. Test parameter input handling
	paramName := "testParam"
	paramType := "string"
	paramDesc := "Test parameter description"

	// Set the parameter input values
	if len(editor.parameterInputs) >= 1 {
		editor.parameterInputs[0].SetValue(paramName)
	} else {
		t.Fatal("Parameter name input not available")
	}

	if len(editor.parameterInputs) >= 2 {
		editor.parameterInputs[1].SetValue(paramType)
	} else {
		t.Fatal("Parameter type input not available")
	}

	if len(editor.parameterInputs) >= 3 {
		editor.parameterInputs[2].SetValue(paramDesc)
	} else {
		t.Fatal("Parameter description input not available")
	}

	// 3. Test saving parameter
	editor.saveParameter()

	// Verify we're out of parameter editing mode
	if editor.editingParameters {
		t.Error("Still in parameter editing mode after saving parameter")
	}

	// Verify parameter was saved correctly
	if len(editor.tool.Parameters) != 1 {
		t.Fatalf("Expected 1 parameter after saving, got %d", len(editor.tool.Parameters))
	}

	param := editor.tool.Parameters[0]
	if param.Name != paramName {
		t.Errorf("Parameter name not saved correctly. Got %q, want %q", param.Name, paramName)
	}

	if param.Type != paramType {
		t.Errorf("Parameter type not saved correctly. Got %q, want %q", param.Type, paramType)
	}

	if param.Description != paramDesc {
		t.Errorf("Parameter description not saved correctly. Got %q, want %q", param.Description, paramDesc)
	}

	// 4. Test editing existing parameter
	editor.selectedParamIndex = 0 // Select first parameter
	editor.editParameter(0)

	// Verify we're back in parameter editing mode
	if !editor.editingParameters {
		t.Error("Not in parameter editing mode when editing existing parameter")
	}

	// Change parameter values
	updatedName := "updatedParam"
	if len(editor.parameterInputs) >= 1 {
		editor.parameterInputs[0].SetValue(updatedName)
		editor.saveParameter()
	} else {
		t.Fatal("Parameter inputs not available when editing")
	}

	// Verify parameter was updated
	if editor.tool.Parameters[0].Name != updatedName {
		t.Errorf("Parameter name not updated correctly. Got %q, want %q",
			editor.tool.Parameters[0].Name, updatedName)
	}

	// 5. Test deleting parameter
	editor.deleteParameter(0)

	// Verify parameter was removed
	if len(editor.tool.Parameters) != 0 {
		t.Errorf("Expected 0 parameters after deletion, got %d", len(editor.tool.Parameters))
	}
}

// TestParameterKeyBindings tests that key combinations for parameter management work
func TestParameterKeyBindings(t *testing.T) {
	// Create a sample tool for testing
	tool := Tool{
		ID:           "keybinding-test",
		Name:         "Keybinding Test",
		Description:  "Testing parameter keybindings",
		Category:     "Test",
		Parameters:   []Parameter{},
		LastModified: time.Now(),
	}

	// Create editor model
	editor := newToolEditorModelWithTool(tool)

	// Test Alt+p to add parameter
	addMsg := tea.KeyMsg{
		Type:  tea.KeyRunes,
		Runes: []rune{'p'},
		Alt:   true,
	}

	updatedModel, _ := editor.Update(addMsg)
	updatedEditor := updatedModel.(toolEditorModel)

	// Verify parameter added via keybinding
	if !updatedEditor.editingParameters {
		t.Error("Not in parameter editing mode after Alt+p")
	}

	if len(updatedEditor.parameterInputs) == 0 {
		t.Error("No parameter inputs created after Alt+p")
	}

	// Set parameter values
	updatedEditor.parameterInputs[0].SetValue("keyParam")
	updatedEditor.parameterInputs[1].SetValue("string")

	// Save parameter with Enter on the last input
	saveMsg := tea.KeyMsg{Type: tea.KeyEnter}
	updatedEditor.focused = len(updatedEditor.parameterInputs) - 1 // Focus last input
	updatedModel, _ = updatedEditor.Update(saveMsg)
	updatedEditor = updatedModel.(toolEditorModel)

	// Verify parameter was saved
	if len(updatedEditor.tool.Parameters) == 0 {
		t.Fatal("Parameter not added via keyboard shortcuts")
	}

	// Test Alt+e to edit parameter
	updatedEditor.selectedParamIndex = 0
	editMsg := tea.KeyMsg{
		Type:  tea.KeyRunes,
		Runes: []rune{'e'},
		Alt:   true,
	}

	updatedModel, _ = updatedEditor.Update(editMsg)
	updatedEditor = updatedModel.(toolEditorModel)

	// Verify in edit mode
	if !updatedEditor.editingParameters {
		t.Error("Not in parameter editing mode after Alt+e")
	}

	// Test Alt+d to delete parameter
	// First cancel current edit
	escMsg := tea.KeyMsg{Type: tea.KeyEsc}
	updatedModel, _ = updatedEditor.Update(escMsg)
	updatedEditor = updatedModel.(toolEditorModel)

	// Now delete
	updatedEditor.selectedParamIndex = 0
	deleteMsg := tea.KeyMsg{
		Type:  tea.KeyRunes,
		Runes: []rune{'d'},
		Alt:   true,
	}

	updatedModel, _ = updatedEditor.Update(deleteMsg)
	updatedEditor = updatedModel.(toolEditorModel)

	// Verify parameter deleted
	if len(updatedEditor.tool.Parameters) > 0 {
		t.Error("Parameter not deleted via keyboard shortcut")
	}
}
