package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	editorTitleStyle     = lipgloss.NewStyle().Bold(true).MarginLeft(2)
	inputLabelStyle      = lipgloss.NewStyle().Width(12).MarginLeft(4)
	activeInputStyle     = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
	inactiveInputStyle   = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))
	editorHelpStyle      = lipgloss.NewStyle().Foreground(lipgloss.Color("240")).MarginLeft(4)
	parameterHeaderStyle = lipgloss.NewStyle().Bold(true).MarginLeft(4)
	parameterStyle       = lipgloss.NewStyle().MarginLeft(6)
	highlightStyle       = lipgloss.NewStyle().Background(lipgloss.Color("205")).Foreground(lipgloss.Color("0"))
)

type toolEditorModel struct {
	nameInput          textinput.Model
	descriptionInput   textinput.Model
	categoryInput      textinput.Model
	parameterInputs    []textinput.Model // Inputs for parameter management
	focused            int
	inputs             []textinput.Model
	tool               Tool
	originalTool       Tool // Added to track the original tool state
	width              int
	height             int
	saving             bool
	editingParameters  bool // Flag to indicate we're editing parameters
	currentParameter   int  // Index of the parameter being edited
	parameterChanged   bool // Flag to indicate parameter changes
	showParameterHelp  bool // Flag to show parameter help dialog
	selectedParamIndex int  // Index of the selected parameter in the list
}

// newToolEditorModel creates a new editor for creating a tool
func newToolEditorModel() toolEditorModel {
	name := textinput.New()
	name.Placeholder = "New Tool"
	name.Focus()
	name.CharLimit = 50
	name.Width = 40

	description := textinput.New()
	description.Placeholder = "Tool description"
	description.CharLimit = 200
	description.Width = 40

	category := textinput.New()
	category.Placeholder = "Category (e.g., CLI, API, Data)"
	category.CharLimit = 30
	category.Width = 40

	inputs := []textinput.Model{name, description, category}

	return toolEditorModel{
		nameInput:          name,
		descriptionInput:   description,
		categoryInput:      category,
		focused:            0,
		inputs:             inputs,
		tool:               Tool{Parameters: []Parameter{}},
		selectedParamIndex: -1,
		// Initialize with empty parameterInputs to avoid nil references
		parameterInputs: []textinput.Model{},
	}
}

// newToolEditorModelWithTool creates a new editor with an existing tool
func newToolEditorModelWithTool(tool Tool) toolEditorModel {
	m := newToolEditorModel()

	// Create a deep copy of the tool to avoid reference issues
	m.tool = tool

	// Ensure tool has a Parameters field initialized
	if m.tool.Parameters == nil {
		m.tool.Parameters = []Parameter{}
	}

	m.originalTool = tool // Save the original tool state

	// Set values to text inputs and ensure they are properly focused
	m.nameInput.SetValue(tool.Name)
	m.descriptionInput.SetValue(tool.Description)
	m.categoryInput.SetValue(tool.Category)

	// Make sure inputs array is synced with the actual input models
	m.inputs[0] = m.nameInput
	m.inputs[1] = m.descriptionInput
	m.inputs[2] = m.categoryInput

	// Ensure the first input is focused
	m.inputs[0].Focus()

	return m
}

// createParameterInputs creates text inputs for editing a parameter
func (m *toolEditorModel) createParameterInputs(param Parameter, isNew bool) []textinput.Model {
	nameInput := textinput.New()
	nameInput.Placeholder = "Parameter name"
	nameInput.CharLimit = 30
	nameInput.Width = 40
	nameInput.Focus()

	typeInput := textinput.New()
	typeInput.Placeholder = "Type (string, number, boolean, object, array)"
	typeInput.CharLimit = 20
	typeInput.Width = 40

	descInput := textinput.New()
	descInput.Placeholder = "Parameter description"
	descInput.CharLimit = 100
	descInput.Width = 40

	requiredInput := textinput.New()
	requiredInput.Placeholder = "Required (true/false)"
	requiredInput.CharLimit = 5
	requiredInput.Width = 20

	// If editing existing parameter, prepopulate the inputs
	if !isNew {
		nameInput.SetValue(param.Name)
		typeInput.SetValue(param.Type)
		descInput.SetValue(param.Description)
		requiredInput.SetValue(strconv.FormatBool(param.Required))
	} else {
		// Default values for new parameters
		typeInput.SetValue("string")
		requiredInput.SetValue("true")
	}

	return []textinput.Model{nameInput, typeInput, descInput, requiredInput}
}

// addNewParameter adds a new parameter to the tool
func (m *toolEditorModel) addNewParameter() {
	// Create a new parameter
	paramID := fmt.Sprintf("p%d", time.Now().UnixNano())
	newParam := Parameter{
		ID:          paramID,
		Name:        "",
		Type:        "string",
		Description: "",
		Required:    true,
	}

	// Add to tool
	m.tool.Parameters = append(m.tool.Parameters, newParam)

	// Create inputs for the new parameter
	m.parameterInputs = m.createParameterInputs(newParam, true)

	// Set editing mode
	m.editingParameters = true
	m.currentParameter = len(m.tool.Parameters) - 1
	m.focused = 0
}

// deleteParameter removes a parameter from the tool
func (m *toolEditorModel) deleteParameter(index int) {
	if index < 0 || index >= len(m.tool.Parameters) {
		return
	}

	// Remove the parameter
	if index == len(m.tool.Parameters)-1 {
		m.tool.Parameters = m.tool.Parameters[:index]
	} else {
		m.tool.Parameters = append(m.tool.Parameters[:index], m.tool.Parameters[index+1:]...)
	}

	// Reset selection if needed
	if m.selectedParamIndex >= len(m.tool.Parameters) {
		m.selectedParamIndex = len(m.tool.Parameters) - 1
	}
}

// editParameter enters edit mode for the selected parameter
func (m *toolEditorModel) editParameter(index int) {
	if index < 0 || index >= len(m.tool.Parameters) {
		return
	}

	// Create inputs for editing the parameter
	m.parameterInputs = m.createParameterInputs(m.tool.Parameters[index], false)

	// Set editing mode
	m.editingParameters = true
	m.currentParameter = index
	m.focused = 0

	// Focus first parameter input
	for i := range m.parameterInputs {
		if i == 0 {
			m.parameterInputs[i].Focus()
		} else {
			m.parameterInputs[i].Blur()
		}
	}
}

// saveParameter saves the current parameter being edited
func (m *toolEditorModel) saveParameter() {
	if len(m.parameterInputs) < 4 || m.currentParameter < 0 || m.currentParameter >= len(m.tool.Parameters) {
		return
	}

	// Get parameter values from inputs
	name := m.parameterInputs[0].Value()
	paramType := m.parameterInputs[1].Value()
	description := m.parameterInputs[2].Value()
	requiredStr := m.parameterInputs[3].Value()

	// Validate parameter type
	validType := false
	for _, t := range ParameterTypes {
		if t == paramType {
			validType = true
			break
		}
	}

	if !validType {
		paramType = "string" // Default to string if invalid
	}

	// Parse required boolean
	required := true // Default to true
	if strings.ToLower(requiredStr) == "false" {
		required = false
	}

	// Update the parameter
	if m.currentParameter < len(m.tool.Parameters) {
		m.tool.Parameters[m.currentParameter].Name = name
		m.tool.Parameters[m.currentParameter].Type = paramType
		m.tool.Parameters[m.currentParameter].Description = description
		m.tool.Parameters[m.currentParameter].Required = required
	}

	// Exit parameter editing mode
	m.editingParameters = false
	m.parameterChanged = true

	// Return focus to main inputs
	m.focused = 0
	for i := range m.inputs {
		if i == m.focused {
			m.inputs[i].Focus()
		} else {
			m.inputs[i].Blur()
		}
	}
}

// cancelParameterEdit cancels the current parameter edit
func (m *toolEditorModel) cancelParameterEdit() {
	m.editingParameters = false

	// Return focus to main inputs
	m.focused = 0
	for i := range m.inputs {
		if i == m.focused {
			m.inputs[i].Focus()
		} else {
			m.inputs[i].Blur()
		}
	}
}

func (m toolEditorModel) Init() tea.Cmd {
	return textinput.Blink
}

// Update method with parameter management support
func (m toolEditorModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		// Update textinput widths
		for i := range m.inputs {
			m.inputs[i].Width = msg.Width - 20
		}

		// Update parameter input widths if needed
		for i := range m.parameterInputs {
			m.parameterInputs[i].Width = msg.Width - 20
		}

		m.nameInput = m.inputs[0]
		m.descriptionInput = m.inputs[1]
		m.categoryInput = m.inputs[2]

		return m, nil

	case tea.KeyMsg:
		// Handle parameter help dialog
		if m.showParameterHelp {
			if msg.Type == tea.KeyEsc || msg.Type == tea.KeyEnter {
				m.showParameterHelp = false
				return m, nil
			}
			return m, nil
		}

		// Handle parameter editing mode
		if m.editingParameters {
			switch msg.String() {
			case "esc":
				// Cancel parameter editing
				m.cancelParameterEdit()
				return m, nil

			case "enter":
				// If on last input, save parameter
				if m.focused == len(m.parameterInputs)-1 {
					m.saveParameter()
					return m, nil
				}

				// Otherwise move to next input
				m.focused++
				if m.focused >= len(m.parameterInputs) {
					m.focused = 0
				}

				// Update focus states
				for i := range m.parameterInputs {
					if i == m.focused {
						m.parameterInputs[i].Focus()
					} else {
						m.parameterInputs[i].Blur()
					}
				}

				return m, nil

			case "tab":
				// Move to next input
				m.focused++
				if m.focused >= len(m.parameterInputs) {
					m.focused = 0
				}

				// Update focus states
				for i := range m.parameterInputs {
					if i == m.focused {
						m.parameterInputs[i].Focus()
					} else {
						m.parameterInputs[i].Blur()
					}
				}

				return m, nil

			case "shift+tab":
				// Move to previous input
				m.focused--
				if m.focused < 0 {
					m.focused = len(m.parameterInputs) - 1
				}

				// Update focus states
				for i := range m.parameterInputs {
					if i == m.focused {
						m.parameterInputs[i].Focus()
					} else {
						m.parameterInputs[i].Blur()
					}
				}

				return m, nil
			}

			// Update parameter inputs
			var cmd tea.Cmd
			var cmds []tea.Cmd

			for i := range m.parameterInputs {
				m.parameterInputs[i], cmd = m.parameterInputs[i].Update(msg)
				cmds = append(cmds, cmd)
			}

			return m, tea.Batch(cmds...)
		}

		// Handle 'q' key properly - don't quit when in a text input
		if msg.String() == "q" && !m.inputs[m.focused].Focused() {
			return m, tea.Quit
		}

		switch msg.String() {
		case "ctrl+c":
			return m, tea.Quit

		case "tab", "shift+tab", "up", "down":
			// Cycle through inputs
			if msg.String() == "up" || msg.String() == "shift+tab" {
				m.focused--
				if m.focused < 0 {
					m.focused = len(m.inputs) - 1
				}
			} else {
				m.focused++
				if m.focused >= len(m.inputs) {
					m.focused = 0
				}
			}

			// Update focus states
			for i := 0; i < len(m.inputs); i++ {
				if i == m.focused {
					m.inputs[i].Focus()
				} else {
					m.inputs[i].Blur()
				}
			}

			m.nameInput = m.inputs[0]
			m.descriptionInput = m.inputs[1]
			m.categoryInput = m.inputs[2]

			return m, nil

			// Fix parameter navigation for Windows
		case "alt+up", "up+alt":
			if len(m.tool.Parameters) == 0 {
				return m, nil
			}

			m.selectedParamIndex--
			if m.selectedParamIndex < 0 {
				m.selectedParamIndex = len(m.tool.Parameters) - 1
			}
			return m, nil

		case "alt+down", "down+alt":
			if len(m.tool.Parameters) == 0 {
				return m, nil
			}

			m.selectedParamIndex++
			if m.selectedParamIndex >= len(m.tool.Parameters) {
				m.selectedParamIndex = 0
			}
			return m, nil

			// Fix parameter management commands for Windows
		case "alt+p", "p+alt": // Add parameter
			m.addNewParameter()
			return m, nil

		case "alt+e", "e+alt": // Edit parameter
			if m.selectedParamIndex >= 0 && m.selectedParamIndex < len(m.tool.Parameters) {
				m.editParameter(m.selectedParamIndex)
			} else if len(m.tool.Parameters) > 0 {
				// If no parameter is selected but we have parameters, select the first one
				m.selectedParamIndex = 0
				m.editParameter(m.selectedParamIndex)
			}
			return m, nil

		case "alt+d", "d+alt": // Delete parameter
			if m.selectedParamIndex >= 0 && m.selectedParamIndex < len(m.tool.Parameters) {
				m.deleteParameter(m.selectedParamIndex)
			}
			return m, nil

		// Also add direct key handling for Windows and other terminals
		default:
			// Handle Alt+P, Alt+E, and Alt+D for platforms where tea.KeyMsg doesn't format as "alt+x"
			if msg.Alt {
				switch string(msg.Runes) {
				case "p", "P":
					m.addNewParameter()
					return m, nil
				case "e", "E":
					if m.selectedParamIndex >= 0 && m.selectedParamIndex < len(m.tool.Parameters) {
						m.editParameter(m.selectedParamIndex)
					} else if len(m.tool.Parameters) > 0 {
						m.selectedParamIndex = 0
						m.editParameter(m.selectedParamIndex)
					}
					return m, nil
				case "d", "D":
					if m.selectedParamIndex >= 0 && m.selectedParamIndex < len(m.tool.Parameters) {
						m.deleteParameter(m.selectedParamIndex)
					}
					return m, nil
				}
			}

			// Handle "?" and "enter" cases
			switch msg.String() {
			case "?": // Show parameter help
				m.showParameterHelp = true
				return m, nil

			case "enter":
				if m.focused == len(m.inputs)-1 {
					// Set saving flag when Enter is pressed on the last field
					m.saving = true
					return m, tea.Quit
				}

				// Move to next input
				m.focused++
				if m.focused >= len(m.inputs) {
					m.focused = 0
				}

				// Update focus states
				for i := 0; i < len(m.inputs); i++ {
					if i == m.focused {
						m.inputs[i].Focus()
					} else {
						m.inputs[i].Blur()
					}
				}

				m.nameInput = m.inputs[0]
				m.descriptionInput = m.inputs[1]
				m.categoryInput = m.inputs[2]

				return m, nil
			}
		}
	}

	// Update all inputs
	var cmd tea.Cmd
	var cmds []tea.Cmd

	for i := range m.inputs {
		m.inputs[i], cmd = m.inputs[i].Update(msg)
		cmds = append(cmds, cmd)
	}

	// Sync inputs back to the model
	m.nameInput = m.inputs[0]
	m.descriptionInput = m.inputs[1]
	m.categoryInput = m.inputs[2]

	// Ensure tool fields are updated dynamically
	m.tool.Name = m.nameInput.Value()
	m.tool.Description = m.descriptionInput.Value()
	m.tool.Category = m.categoryInput.Value()

	return m, tea.Batch(cmds...)
}

func (m toolEditorModel) View() string {
	var b strings.Builder

	title := "Create New Tool"
	if m.tool.ID != "" {
		title = "Edit Tool"
	}

	b.WriteString(editorTitleStyle.Render(title) + "\n\n")

	// Name
	b.WriteString(inputLabelStyle.Render("Name:"))
	b.WriteString(m.nameInput.View() + "\n\n")

	// Description
	b.WriteString(inputLabelStyle.Render("Description:"))
	b.WriteString(m.descriptionInput.View() + "\n\n")

	// Category
	b.WriteString(inputLabelStyle.Render("Category:"))
	b.WriteString(m.categoryInput.View() + "\n\n")

	// Parameters section
	b.WriteString(parameterHeaderStyle.Render("Parameters:") + "\n")

	if m.editingParameters {
		// Show parameter editing form
		paramLabels := []string{"Name:", "Type:", "Description:", "Required:"}

		for i, input := range m.parameterInputs {
			b.WriteString(inputLabelStyle.Render(paramLabels[i]))
			b.WriteString(input.View() + "\n\n")
		}

		b.WriteString(editorHelpStyle.Render("enter: save parameter • esc: cancel"))
	} else {
		// Show parameter list
		if len(m.tool.Parameters) == 0 {
			b.WriteString(parameterStyle.Render("[No parameters defined]") + "\n\n")
		} else {
			for i, param := range m.tool.Parameters {
				paramLine := fmt.Sprintf("- %s (%s)", param.Name, param.Type)
				if m.selectedParamIndex == i {
					paramLine = highlightStyle.Render(paramLine)
				}
				b.WriteString(parameterStyle.Render(paramLine) + "\n")
			}
			b.WriteString("\n")
		}

		// Show parameter help dialog if active
		if m.showParameterHelp {
			help := strings.Join([]string{
				"Parameter Management:",
				"",
				"Alt+p: Add new parameter",
				"Alt+e: Edit selected parameter",
				"Alt+d: Delete selected parameter",
				"Alt+up/down: Navigate parameters",
				"",
				"Press ESC or Enter to close this help dialog",
			}, "\n")

			b.WriteString("\n" + lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("205")).
				Padding(1, 3).
				Render(help) + "\n")
		} else {
			// Main help
			help := "tab: next • shift+tab: prev • enter: save • ?: help • esc: cancel"
			b.WriteString(editorHelpStyle.Render(help))
		}
	}

	return b.String()
}

// getTool returns a tool based on the current input values
func (m toolEditorModel) getTool() Tool {
	tool := m.tool
	tool.Name = m.nameInput.Value()
	tool.Description = m.descriptionInput.Value()
	tool.Category = m.categoryInput.Value()
	tool.LastModified = time.Now()

	// Ensure Parameters is not nil
	if tool.Parameters == nil {
		tool.Parameters = []Parameter{}
	}

	// Set default status if not already set
	if tool.Status == "" {
		tool.Status = "active"
	}

	return tool
}
