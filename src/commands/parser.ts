import * as P from "parsimmon";

// Command types
export type ViewToggleCommand = { type: "VIEW_TOGGLE" };
export type ThemeToggleCommand = { type: "THEME_TOGGLE" };
export type ModelCallCommand = { 
  type: "MODEL_CALL"; 
  model: string; 
  count?: number;
};
export type AddKeyCommand = {
  type: "ADD_KEY";
  key: string;
};
export type ClearKeyCommand = {
  type: "CLEAR_KEY";
};
export type ResetCommand = {
  type: "RESET";
};

export type Command = 
  | ViewToggleCommand
  | ThemeToggleCommand
  | ModelCallCommand
  | AddKeyCommand
  | ClearKeyCommand
  | ResetCommand;

// Create language definition
const CommandLanguage = P.createLanguage({
  // Whitespace
  _: () => P.regexp(/\s*/),
  
  // Basic tokens
  number: () => P.regexp(/[0-9]+/).map(Number),
  key: () => P.regexp(/[a-zA-Z0-9_-]+/),
  
  // Simple commands
  viewToggle: () => P.string("view").map((): ViewToggleCommand => ({ 
    type: "VIEW_TOGGLE" 
  })),
  
  themeToggle: () => P.string("theme").map((): ThemeToggleCommand => ({ 
    type: "THEME_TOGGLE" 
  })),
  
  // Model call command
  modelCall: (r) => P.seq(
    P.string("@"),
    P.regexp(/[a-zA-Z]+/),
    r._.then(r.number.or(P.succeed(undefined)))
  ).map(([_, model, count]): ModelCallCommand => ({
    type: "MODEL_CALL",
    model,
    count
  })),

  // Add key command
  addKey: (r) => P.seq(
    P.string("addkey"),
    r._,
    r.key
  ).map(([_, __, key]): AddKeyCommand => ({
    type: "ADD_KEY",
    key
  })),

  // Clear key command
  clearKey: () => P.string("clearkey").map((): ClearKeyCommand => ({
    type: "CLEAR_KEY"
  })),

  // Reset command
  reset: () => P.string("reset").map((): ResetCommand => ({
    type: "RESET"
  })),
  
  // Main command parser
  command: (r) => P.alt(
    r.viewToggle,
    r.themeToggle,
    r.modelCall,
    r.addKey,
    r.clearKey,
    r.reset
  ).trim(r._),
});

export function parseCommand(input: string): Command | null {
  try {
    const result = CommandLanguage.command.parse(input);
    if (result.status) {
      return result.value;
    }
    console.log("Parse error:", result);
    return null;
  } catch (error) {
    console.log("Parse error:", error);
    return null;
  }
}

// Autocomplete support
export type Suggestion = {
  text: string;
  displayText: string;
  description: string;
};

export function getSuggestions(input: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Basic commands
  if ("view".startsWith(input)) {
    suggestions.push({
      text: "view",
      displayText: "view",
      description: "Toggle between forest and path view",
    });
  }
  
  if ("theme".startsWith(input)) {
    suggestions.push({
      text: "theme",
      displayText: "theme",
      description: "Toggle between light and dark theme",
    });
  }
  
  if ("addkey".startsWith(input)) {
    suggestions.push({
      text: "addkey ",
      displayText: "addkey <key>",
      description: "Add an OpenRouter API key",
    });
  }

  if ("clearkey".startsWith(input)) {
    suggestions.push({
      text: "clearkey",
      displayText: "clearkey",
      description: "Remove the OpenRouter API key",
    });
  }

  if ("reset".startsWith(input)) {
    suggestions.push({
      text: "reset",
      displayText: "reset",
      description: "Reset to initial state",
    });
  }
  
  // Model commands
  if ("@go".startsWith(input)) {
    suggestions.push({
      text: "@go",
      displayText: "@go [count]",
      description: "Generate completions using the 'go' model",
    });
  }
  
  return suggestions;
} 