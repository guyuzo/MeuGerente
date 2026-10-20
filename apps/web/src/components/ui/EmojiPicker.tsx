import { useState } from "react";
import { cn } from "../../lib/utils";
import { Modal } from "./Modal";

const EMOJIS = [
  "📦", "👕", "👗", "👟", "👜", "💄", "💅", "🧴", "🧼", "🪒",
  "🏠", "🛋️", "🪑", "💡", "🔌", "🧹", "🧺", "🍳", "🍽️", "🧸",
  "📱", "💻", "🎧", "📷", "⌚", "🎮", "📚", "🧵", "🎒", "👶",
  "🐶", "🐱", "🌿", "🕯️", "⚽", "🎁", "💍", "🕶️", "🔧", "🧊",
];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
}

/** Seletor de emoji do produto — grade curada, reaproveita Modal em vez de upload/URL de imagem. */
export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Escolher emoji"
        className="w-14 h-14 rounded-md bg-neutral-150 flex items-center justify-center text-2xl hover:bg-neutral-200"
      >
        {value || "📦"}
      </button>

      <Modal aberto={aberto} titulo="Escolher emoji" onFechar={() => setAberto(false)}>
        <div className="grid grid-cols-6 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setAberto(false);
              }}
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center text-xl hover:bg-neutral-150",
                value === emoji && "bg-neutral-150 ring-2 ring-neutral-900",
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
