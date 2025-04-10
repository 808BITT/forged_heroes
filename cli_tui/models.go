package main

import "time"

// Tool represents a tool specification
type Tool struct {
	ID           string      `json:"id"`
	Name         string      `json:"name"`
	Description  string      `json:"description"`
	Category     string      `json:"category"`
	Parameters   []Parameter `json:"parameters"`
	Status       string      `json:"status"` // "active", "inactive", "draft"
	LastModified time.Time   `json:"lastModified"`
}

// Parameter represents a tool parameter
// Updated to include validation and additional metadata
type Parameter struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Type        string      `json:"type"` // "string", "number", "boolean", "object", "array"
	Description string      `json:"description"`
	Required    bool        `json:"required"`
	Default     interface{} `json:"default,omitempty"`
	Options     []string    `json:"options,omitempty"` // For enum-like parameters
	Min         *float64    `json:"min,omitempty"`     // For numeric parameters
	Max         *float64    `json:"max,omitempty"`     // For numeric parameters
}

// ParameterTypes defines valid parameter types
var ParameterTypes = []string{"string", "number", "boolean", "object", "array"}

// DefaultCategories defines default tool categories
var DefaultCategories = []string{"General", "CLI", "API", "Data"}

// listItem represents an item in a list with a description
type listItem struct {
	Description string
}

// Rename the Description method to avoid conflict with the Description field
func (i listItem) Detail() string { return i.Description }
