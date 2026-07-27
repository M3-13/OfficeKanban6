import { useState, useRef, type KeyboardEvent } from "react";
import { updateColumn, deleteColumn, type ColumnData } from "../api/columns";
import Card from "./Card";
import CreateCardForm from "./CreateCardForm";
import type { CardData } from "../api/cards";
import { useCardDrop } from "../hooks/useCardDrop";

interface ColumnProps {
  column: ColumnData;
  cards?: CardData[];
  onUpdate: (updated: ColumnData) => void;
  onDelete: (id: number) => void;
  onCardCreated?: (columnId: number) => void;
  onCardUpdated?: (card: CardData) => void;
  onCardDeleted?: (cardId: number, columnId: number) => void;
  onCardDrop?: (
    cardId: number,
    sourceColumnId: number,
    targetColumnId: number,
    targetPosition: number,
  ) => void;
}

function Column({
  column,
  cards = [],
  onUpdate,
  onDelete,
  onCardCreated,
  onCardUpdated,
  onCardDeleted,
  onCardDrop,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { dragOver, handleDragOver, handleDragLeave, handleDrop } = useCardDrop(
    column.id,
    onCardDrop ?? (() => {}),
    cards.length,
  );

  function startEditing() {
    setEditTitle(column.title);
    setIsEditing(true);
    setError("");
    setTimeout(() => editInputRef.current?.focus(), 0);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditTitle(column.title);
    setError("");
  }

  async function saveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed.length === 0) {
      setError("Titel darf nicht leer sein.");
      return;
    }
    if (trimmed.length > 100) {
      setError("Titel darf maximal 100 Zeichen lang sein.");
      return;
    }
    if (trimmed === column.title) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateColumn(column.id, { title: trimmed });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Umbenennen.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteColumn(column.id);
      onDelete(column.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fehler beim Löschen.",
      );
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundColor: "#EEEEF2",
        borderRadius: "var(--radius-lg)",
        minWidth: "280px",
        maxWidth: "320px",
        width: "280px",
        padding: "var(--space-2)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        flexShrink: 0,
        border: dragOver ? "2px dashed var(--color-accent, #3B5CCC)" : "2px solid transparent",
        transition: "border-color 0.15s ease",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: "var(--color-fg)",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "32px",
        }}
      >
        {isEditing ? (
          <div style={{ flex: 1, marginRight: "8px" }}>
            <input
              ref={editInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                setError("");
              }}
              onKeyDown={handleEditKeyDown}
              onBlur={saveTitle}
              disabled={saving}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: error
                  ? "1px solid var(--color-danger)"
                  : "1px solid var(--color-border)",
                color: "var(--color-fg)",
                fontSize: "14px",
                fontFamily: "inherit",
                width: "100%",
                boxSizing: "border-box",
                minHeight: "36px",
              }}
            />
          </div>
        ) : (
          <span
            onClick={startEditing}
            style={{
              cursor: "pointer",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title="Klicken zum Umbenennen"
          >
            {column.title}
          </span>
        )}
        {cards.length > 0 && (
          <span
            style={{
              background: "#D8DAE5",
              color: "#5A5B6A",
              borderRadius: "var(--radius-pill)",
              fontSize: "12px",
              padding: "1px 8px",
              marginLeft: "8px",
            }}
          >
            {cards.length}
          </span>
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            cursor: deleting ? "not-allowed" : "pointer",
            fontSize: "18px",
            lineHeight: 1,
            padding: "0 4px",
            borderRadius: "var(--radius-sm)",
            opacity: deleting ? 0.45 : 1,
            minHeight: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Spalte löschen"
        >
          &times;
        </button>
      </div>

      {error && (
        <div
          style={{
            color: "var(--color-danger)",
            fontSize: "13px",
            padding: "4px 8px",
          }}
        >
          {error}
        </div>
      )}

      {showDeleteConfirm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--color-fg)" }}>
            Wirklich löschen?
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-1)",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "transparent",
                color: "var(--color-muted)",
                fontWeight: 600,
                fontSize: "13px",
                border: "1px solid var(--color-border)",
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.45 : 1,
                minHeight: "32px",
              }}
            >
              Nein
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-danger)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.45 : 1,
                minHeight: "32px",
              }}
            >
              {deleting ? "Löschen..." : "Ja, löschen"}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        {cards.length === 0 ? (
          <div
            style={{
              color: "var(--color-muted)",
              fontSize: "14px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            Keine Karten
          </div>
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onCardUpdated}
              onDelete={(cardId) => onCardDeleted?.(cardId, column.id)}
            />
          ))
        )}
        <CreateCardForm
          columnId={column.id}
          onCardCreated={() => onCardCreated?.(column.id)}
        />
      </div>
    </div>
  );
}

export default Column;
