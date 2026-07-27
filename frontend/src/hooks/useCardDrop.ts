import { useState, useCallback } from "react";

interface DragCardData {
  id: number;
  column_id: number;
  position: number;
}

export function useCardDrop(
  columnId: number,
  onCardDrop: (
    cardId: number,
    sourceColumnId: number,
    targetColumnId: number,
    targetPosition: number,
  ) => void,
  cardCount: number = 0,
) {
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
      if (!raw) return;

      try {
        const data = JSON.parse(raw) as DragCardData;
        if (data.column_id !== columnId) {
          onCardDrop(data.id, data.column_id, columnId, cardCount + 1);
        }
      } catch {
        // invalid data, ignore
      }
    },
    [columnId, onCardDrop, cardCount],
  );

  return { dragOver, handleDragOver, handleDragLeave, handleDrop } as const;
}
