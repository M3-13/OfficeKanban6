import { useState, useCallback, type ReactNode } from "react";

interface ColumnProps {
  column: {
    id: number;
    title: string;
    position: number;
    user_id: number;
  };
  children?: ReactNode;
  onCardDrop?: (cardId: number, sourceColumnId: number) => void;
}

function Column({ column, children, onCardDrop }: ColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (
      e.currentTarget instanceof HTMLElement &&
      !e.currentTarget.contains(e.relatedTarget as Node)
    ) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const raw = e.dataTransfer.getData("application/json");
      if (!raw || !onCardDrop) return;

      try {
        const data = JSON.parse(raw) as { id: number; column_id: number };
        if (data.column_id !== column.id) {
          onCardDrop(data.id, data.column_id);
        }
      } catch {
        // invalid data, ignore
      }
    },
    [column.id, onCardDrop],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: "var(--color-column-bg, #EEEEF2)",
        borderRadius: "var(--radius-lg, 12px)",
        minWidth: "280px",
        maxWidth: "320px",
        padding: "var(--space-2, 12px)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1, 8px)",
        border: dragOver
          ? "2px dashed var(--color-accent, #3B5CCC)"
          : "2px solid transparent",
        transition: "border-color 0.15s ease",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: "var(--color-fg, #1A1A2E)",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{column.title}</span>
      </div>
      {children}
    </div>
  );
}

export default Column;
