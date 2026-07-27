import { useState, useRef, type FormEvent } from "react";
import { createColumn, type ColumnData } from "../api/columns";

interface CreateColumnFormProps {
  onCreated: (column: ColumnData) => void;
}

function CreateColumnForm({ onCreated }: CreateColumnFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCancel() {
    setIsOpen(false);
    setTitle("");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      setError("Titel darf nicht leer sein.");
      return;
    }
    if (trimmed.length > 100) {
      setError("Titel darf maximal 100 Zeichen lang sein.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const column = await createColumn({ title: trimmed });
      onCreated(column);
      setTitle("");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen der Spalte.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={handleOpen}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-accent)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            minHeight: "44px",
            whiteSpace: "nowrap",
          }}
        >
          + Neue Spalte
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "var(--space-1)",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="Spaltenname"
              maxLength={100}
              disabled={submitting}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: error
                  ? "1px solid var(--color-danger)"
                  : "1px solid var(--color-border)",
                color: "var(--color-fg)",
                fontSize: "14px",
                fontFamily: "inherit",
                width: "100%",
                minHeight: "44px",
                boxSizing: "border-box",
                boxShadow: error
                  ? "0 0 0 3px rgba(217,59,72,0.15)"
                  : undefined,
              }}
            />
            {error && (
              <div
                style={{
                  color: "var(--color-danger)",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {error}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-accent)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              minHeight: "44px",
              opacity: submitting ? 0.45 : 1,
              whiteSpace: "nowrap",
            }}
          >
            Hinzufügen
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "transparent",
              color: "var(--color-muted)",
              fontWeight: 600,
              fontSize: "14px",
              border: "1px solid var(--color-border)",
              cursor: submitting ? "not-allowed" : "pointer",
              minHeight: "44px",
              opacity: submitting ? 0.45 : 1,
              whiteSpace: "nowrap",
            }}
          >
            Abbrechen
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateColumnForm;
