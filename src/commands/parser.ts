import * as P from "parsimmon";

// Command types
export type ViewToggleCommand = { type: "VIEW_TOGGLE" };
export type ThemeToggleCommand = { type: "THEME_TOGGLE" };
export type ModelCallCommand = { 
  type: "MODEL_CALL"; 
  model: string; 
  count?: number;
};

export type Command = 
  | ViewToggleCommand
  | ThemeToggleCommand
  | ModelCallCommand;

// Create language definition
const CommandLanguage = P.createLanguage({
  // Whitespace
  _: () => P.regexp(/\s*/),
  
  // Basic tokens
  number: () => P.regexp(/[0-9]+/).map(Number),
  
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
  
  // Main command parser
  command: (r) => P.alt(
    r.viewToggle,
    r.themeToggle,
    r.modelCall
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