package main

import (
	"os"

	tea "github.com/charmbracelet/bubbletea"
)

type appModel struct {
	currentView string
	toolList    toolListModel
	toolEditor  toolEditorModel
	width       int
	height      int
	store       *Store
}

func newAppModel(store *Store) appModel {
	tools := store.GetTools()
	return appModel{
		currentView: "list",
		toolList:    newToolListModel(tools),
		toolEditor:  newToolEditorModel(),
		store:       store,
	}
}

func (m appModel) Init() tea.Cmd {
	return tea.Batch(
		m.toolList.Init(),
		tea.EnterAltScreen,
	)
}

func (m appModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		// Update children with window size
		var cmd tea.Cmd
		listModel, cmd := m.toolList.Update(msg)
		m.toolList = listModel.(toolListModel)
		cmds = append(cmds, cmd)

		editorModel, cmd := m.toolEditor.Update(msg)
		m.toolEditor = editorModel.(toolEditorModel)
		cmds = append(cmds, cmd)

		return m, tea.Batch(cmds...)

	case tea.KeyMsg:
		// Special handling for editor view
		if m.currentView == "editor" {
			// Let the editor handle the key event first
			updatedModel, cmd := m.toolEditor.Update(msg)
			updatedEditor := updatedModel.(toolEditorModel)
			m.toolEditor = updatedEditor

			// Check if the editor is indicating that the tool should be saved
			if updatedEditor.saving {
				// Save the tool
				tool := updatedEditor.getTool()
				if tool.ID == "" {
					m.store.AddTool(tool)
				} else {
					m.store.UpdateTool(tool)
				}

				// Get fresh tools from store and update tool list
				tools := m.store.GetTools()
				m.toolList = newToolListModel(tools)

				// After saving a tool, refresh the tool list
				m.toolList.RefreshTools()

				// Return to list view
				m.currentView = "list"
				return m, nil
			}

			// Handle escape key to exit editor view
			if msg.String() == "esc" {
				m.currentView = "list"
				return m, nil
			}

			// Return any command from the editor
			if cmd != nil {
				return m, cmd
			}

			// Only check for 'q' or 'ctrl+c' to exit if not handled by editor
			if msg.String() == "q" || msg.String() == "ctrl+c" {
				m.currentView = "list"
				return m, nil
			}

			return m, nil
		}

		// Handle normal key events when not in editor
		switch msg.String() {
		case "ctrl+c", "q":
			if m.currentView == "list" {
				return m, tea.Quit
			}

		case "enter":
			if m.currentView == "list" {
				// Get selected tool or create new one
				if len(m.toolList.tools) > 0 && m.toolList.selected >= 0 {
					selectedTool := m.toolList.tools[m.toolList.selected]
					m.toolEditor = newToolEditorModelWithTool(selectedTool)
				} else {
					m.toolEditor = newToolEditorModel()
				}
				m.currentView = "editor"
				return m, nil
			}
		}
	}

	// Update the current view
	switch m.currentView {
	case "list":
		updatedModel, cmd := m.toolList.Update(msg)
		m.toolList = updatedModel.(toolListModel)
		cmds = append(cmds, cmd)

	case "editor":
		// This case is handled above for key events,
		// but we still need to handle other types of messages
		if _, ok := msg.(tea.KeyMsg); !ok {
			updatedModel, cmd := m.toolEditor.Update(msg)
			m.toolEditor = updatedModel.(toolEditorModel)
			cmds = append(cmds, cmd)
		}
	}

	return m, tea.Batch(cmds...)
}

func (m appModel) View() string {
	switch m.currentView {
	case "list":
		return m.toolList.View()
	case "editor":
		return m.toolEditor.View()
	}
	return ""
}

func main() {
	store, err := NewStore("../data/tools.json")
	if err != nil {
		os.Exit(1)
	}

	p := tea.NewProgram(newAppModel(store), tea.WithAltScreen())

	if _, err := p.Run(); err != nil {
		os.Exit(1)
	}
}
