package main

import (
	"strings"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	titleStyle        = lipgloss.NewStyle().MarginLeft(2).Bold(true)
	itemStyle         = lipgloss.NewStyle().MarginLeft(4)
	selectedItemStyle = lipgloss.NewStyle().MarginLeft(2).Foreground(lipgloss.Color("170"))
	helpStyle         = lipgloss.NewStyle().Foreground(lipgloss.Color("241")).MarginLeft(4)
)

// RefreshToolsMsg is a message to refresh the tool list
type RefreshToolsMsg struct{}

type toolListModel struct {
	list     list.Model
	width    int
	height   int
	selected int
	tools    []Tool
	store    *Store
}

func newToolListModel(tools []Tool) toolListModel {
	items := make([]list.Item, len(tools))
	for i, tool := range tools {
		items[i] = toolItem{tool}
	}

	delegate := list.NewDefaultDelegate()
	delegate.Styles.SelectedTitle = selectedItemStyle
	delegate.Styles.SelectedDesc = selectedItemStyle

	l := list.New(items, delegate, 0, 0)
	l.Title = "Tools"
	l.SetShowStatusBar(true)
	l.SetFilteringEnabled(true)
	l.SetShowHelp(true)
	l.SetShowPagination(true)

	return toolListModel{
		list:  l,
		tools: tools,
	}
}

func (m toolListModel) Init() tea.Cmd {
	return nil
}

func (m toolListModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.list.SetWidth(msg.Width)
		m.list.SetHeight(msg.Height - 4)
		return m, nil
	case RefreshToolsMsg:
		// If we have a store reference, refresh the tools from it
		if m.store != nil {
			m.tools = m.store.GetTools()
			items := make([]list.Item, len(m.tools))
			for i, tool := range m.tools {
				items[i] = toolItem{tool}
			}
			m.list.SetItems(items)
		}
		return m, nil
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)

	if i, ok := m.list.SelectedItem().(toolItem); ok {
		m.selected = indexOf(m.tools, i.ID)
	}

	return m, cmd
}

// SetStore sets the store for this model to enable refreshing
func (m *toolListModel) SetStore(store *Store) {
	m.store = store
}

// RefreshTools updates the tool list with fresh data from the store
func (m *toolListModel) RefreshTools() {
	if m.store != nil {
		m.tools = m.store.GetTools()
		items := make([]list.Item, len(m.tools))
		for i, tool := range m.tools {
			items[i] = toolItem{tool}
		}
		m.list.SetItems(items)
	}
}

func (m toolListModel) View() string {
	if len(m.list.Items()) == 0 {
		return titleStyle.Render("No tools available") + "\n\n" +
			itemStyle.Render("Press Enter to create a new tool.")
	}

	helpText := helpStyle.Render("j/k: navigate • enter: select • q: quit")
	return m.list.View() + "\n" + helpText
}

// toolItem is a wrapper around Tool to implement list.Item
type toolItem struct {
	Tool
}

func (i toolItem) Title() string {
	return i.Name
}

// Updated toolItem to include parameter details in the description
func (i toolItem) Description() string {
	if len(i.Parameters) == 0 {
		return "No parameters defined"
	}

	var paramDetails []string
	for _, param := range i.Parameters {
		paramDetails = append(paramDetails, param.Name+" ("+param.Type+")")
	}

	return strings.Join(paramDetails, ", ")
}

func (i toolItem) FilterValue() string {
	return i.Name
}

// indexOf finds the index of a tool in a slice by ID
func indexOf(tools []Tool, id string) int {
	for i, t := range tools {
		if t.ID == id {
			return i
		}
	}
	return -1
}
