import { motion } from "framer-motion";
import { KeyboardKey } from "./keyboard-key";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      {
        action: "Focus chat input",
        keys: ["Enter"],
      },
      {
        action: "Clear input",
        keys: ["Esc"],
      },
      {
        action: "Toggle thinking process",
        keys: ["Ctrl", "Z"],
      },
      {
        action: "Navigate history",
        keys: ["↑", "↓"],
      }
    ]
  },
  {
    category: "Actions",
    items: [
      {
        action: "New chat",
        keys: ["Ctrl", "Shift", "N"],
      },
      {
        action: "Copy last response",
        keys: ["Ctrl", "Shift", "C"],
      },
      {
        action: "Copy code block",
        keys: ["Ctrl", "Shift", ";"],
      },
      {
        action: "Show shortcuts",
        keys: ["Ctrl", "/"],
      }
    ]
  }
];

export function KeyboardShortcuts() {
  return (
    <div className="grid grid-flow-row grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-9">
      {shortcuts.map((category) => (
        <div key={category.category} className="flex flex-col overflow-hidden">
          {category.items.map((shortcut) => (
            <div 
              key={shortcut.action}
              className="flex items-center justify-between overflow-hidden text-token-text-primary"
            >
              <div className="flex flex-shrink items-center overflow-hidden text-sm">
                <div className="truncate">{shortcut.action}</div>
              </div>
              <div className="ml-3 flex flex-row gap-2">
                {shortcut.keys.map((key) => (
                  <KeyboardKey key={key}>{key}</KeyboardKey>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}