# Loon: Prototype Specification

## Overview

Loon is a client-side application for exploring and managing conversations with language models. It is based on loom UIs in particular https://github.com/socketteer/loom. It featues multiplexed prompting, branching conversations, and structured exploration of interaction patterns. The system maintains a tree of messages from various sources (human, model, tools) and provides interfaces for navigation, editing, and model interaction.

## Core Data Types

```typescript
// Unique identifiers for nodes in the message tree
type NodeId = string;

// Message sources - extensible for future tool integration
type Source =
  | "human" // User-entered content
  | "model" // LLM responses
  | "system"; // System messages (errors, status)

// Core message type
interface Message {
  content: string;
  source: Source;
  timestamp: Date;
  metadata?: Record<string, unknown>; // Extensible metadata
}

// Node in the message tree
interface Node {
  id: NodeId;
  message: Message;
  parent?: NodeId;
  children: NodeId[]; // Ordered list of child nodes
  isEdited: boolean; // Track if this is an edited copy
}

// Main state tree
interface Loom {
  nodes: Map<NodeId, Node>;
  root: NodeId;
}

// Configuration for model API calls
interface ModelConfig {
  endpoint: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    // Other model-specific parameters
  };
  headers: Record<string, string>;
}

// Application state
interface Model {
  // Core data
  loom: Loom;

  // View state
  currentPath: NodeId[]; // Currently focused path from root
  expanded: Set<NodeId>; // Nodes expanded beyond default height
  focus: {
    commandBar: boolean;
    textBox?: NodeId;
  };

  // Configuration
  config: {
    apiKeys: Record<string, string>;
    modelCards: Record<string, ModelConfig>;
  };

  // Request state
  pending: Map<NodeId, number>; // Tracks in-flight completions
}
```

## Actions

```typescript
type Action =
  // Navigation
  | { type: "NavigateSibling"; direction: "prev" | "next" }
  | { type: "NavigateVertical"; direction: "up" | "down" }
  | { type: "FocusNode"; id: NodeId }
  | { type: "FocusCommandBar" }

  // Content
  | { type: "EditNode"; id: NodeId; content: string }
  | { type: "ResizeNode"; id: NodeId; height: number }

  // Model Interaction
  | {
      type: "RequestCompletions";
      parentId: NodeId;
      modelId: string;
      count: number;
    }
  | { type: "CompletionReceived"; parentId: NodeId; content: string }
  | { type: "CompletionError"; parentId: NodeId; error: string }

  // Configuration
  | { type: "SetApiKey"; service: string; key: string };
```

## View Structure

The application consists of two main components:

1. Command Bar (top)

   - Single-line input field
   - Simple command syntax: @<model> [count]
   - Basic autocomplete for model names
   - Examples: "@go 8", "@claude 4"

2. Forest View (main area)
   - Vertical stack of text boxes
   - Each box represents one node in the current path
   - Fixed height initially (e.g., 3 lines)
   - Left/right arrows for sibling navigation
   - Visual indicators for:
     - Focus state (border highlight)
     - Pending completions (loading indicator)
     - Available siblings (arrow colors)
     - Edited nodes (subtle background)

## Core Behaviors

### Navigation

- Arrow keys navigate between boxes when at text boundaries
- Modifier + arrow for direct sibling/vertical navigation
- Command bar focus with Tab/Shift+Tab
- Clicking text box sets focus

### Editing

- Freely edit boxes with no responses
- Editing a box with responses creates a new sibling copy
- Enter in command bar executes command for focused node

### Model Interaction

- Commands trigger API requests via OpenRouter
- Default "go" model configuration provided
- Simple retry mechanism for failed requests
- Maximum of 8 completions per request

## Initial Command Set

```typescript
interface Command {
  execute: (args: string[], model: Model) => Action[];
}

const commands: Record<string, Command> = {
  "@go": {
    // Default model interaction
    execute: (args, model) => [
      {
        type: "RequestCompletions",
        parentId: model.currentPath[model.currentPath.length - 1],
        modelId: "go",
        count: Math.min(parseInt(args[0] ?? "4"), 8),
      },
    ],
  },
};
```

## Persistence

- Store state in localStorage
- Save on significant state changes:
  - New nodes
  - Content edits
  - Configuration changes
- Simple export/import via JSON

## Implementation Guidelines

1. View Framework

   - Use a lightweight framework supporting MVU
   - Avoid complex state management libraries
   - Maintain strict unidirectional data flow

2. Styling

   - Minimal, monospace-based design
   - CSS Grid for layout
   - Simple transitions for navigation
   - Clear focus states

3. Error Handling

   - Graceful API failure handling
   - Clear error messages in system nodes
   - Retry mechanism for flaky connections

4. Performance
   - Virtualize large tree renders
   - Debounce rapid navigation
   - Throttle API requests

## Future Considerations

While out of scope for the prototype, design should accommodate:

1. Enhanced Command Bar

   - Structured editor integration
   - Rich command completion
   - Command history

2. Advanced Views

   - Multiple simultaneous paths
   - Alternative tree visualizations
   - Animated transitions between views

3. Tool Integration

   - Language server protocol support
   - Structured response handling
   - Automated verification workflows

4. Tree Operations
   - Cut operation for context management
   - Branch merging
   - Advanced navigation patterns

## Development Priorities

1. Phase 1: Core Infrastructure

   - Basic state management
   - Local persistence
   - Simple navigation

2. Phase 2: Model Integration

   - OpenRouter API integration
   - Basic completion handling
   - Error management

3. Phase 3: UI Polish

   - Command bar implementation
   - Navigation refinements
   - Basic styling

4. Phase 4: User Experience
   - Keyboard shortcuts
   - Basic error recovery
   - Simple export/import

This specification provides the foundation for an initial implementation while maintaining extensibility for future enhancements.
