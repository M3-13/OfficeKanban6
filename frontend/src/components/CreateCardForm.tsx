import { useState, useCallback } from "react";
import * as cardsApi from "../api/cards";

interface CreateCardFormProps {
  columnId: number;
  onCardCreated?: () => void;
}

function CreateCardForm({ columnId, onCardCreated }: CreateCardFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Titel ist erforderlich");
        return;
      }
      if (trimmedTitle.length > 200) {
        setError("Titel darf maximal 200 Zeichen haben");
        return;
      }
      if (description.length > 2000) {
        setError("Beschreibung darf maximal 2000 Zeichen haben");
        return;
      }
      setSaving(true);
      setError("");
      try {
        await cardsApi.createCard(trimmedTitle, description, columnId);
        setTitle("");
        setDescription("");
        setOpen(false);
        onCardCreated?.();
      } catch {
        setError("Karte konnte nicht erstellt werden");
      } finally {
        setSaving(false);
      }
    },
    [title, description, columnId, onCardCreated],
  );

  const handleCancel = useCallback(() => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setError("");
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          padding: "10px 16px",
          borderRadius: "var(--radius-md, 8px)",
          background: "transparent",
          color: "var(--color-muted, #8E8E9A)",
          fontWeight: 600,
          fontSize: "14px",
          border: "1px dashed var(--color-border, #E0E0E6)",
          minHeight: "44px",
          cursor: "pointer",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.color = "var(--color-accent, #3B5CCC)";
          (e.target as HTMLButtonElement).style.borderColor =
            "var(--color-accent, #3B5CCC)";
          (e.target as HTMLButtonElement).style.background = "#F0F1F8";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.color = "var(--color-muted, #8E8E9A)";
          (e.target as HTMLButtonElement).style.borderColor =
            "var(--color-border, #E0E0E6)";
          (e.target as HTMLButtonElement).style.background = "transparent";
        }}
      >
        + Karte hinzufügen
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1, 8px)",
      }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        maxLength={200}
        required
        autoFocus
        placeholder="Titel der Karte"
        style={{
          padding: "10px 14px",
          borderRadius: "var(--radius-md, 8px)",
          background: "var(--color-surface, #FFFFFF)",
          border: error
            ? "1px solid var(--color-danger, #D93B48)"
            : "1px solid var(--color-border, #E0E0E6)",
          color: "var(--color-fg, #1A1A2E)",
          fontSize: "14px",
          fontFamily: "inherit",
          width: "100%",
          minHeight: "44px",
          boxSizing: "border-box",
          outline: "none",
        }}
        onFocus={(e) => {
          if (!error) {
            (e.target as HTMLInputElement).style.borderColor =
              "var(--color-accent, #3B5CCC)";
            (e.target as HTMLInputElement).style.boxShadow =
              "0 0 0 3px rgba(59,92,204,0.15)";
          }
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = error
            ? "var(--color-danger, #D93B48)"
            : "var(--color-border, #E0E0E6)";
          (e.target as HTMLInputElement).style.boxShadow = "none";
        }}
      />
      <textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setError("");
        }}
        maxLength={2000}
        rows={3}
        placeholder="Beschreibung (optional)"
        style={{
          padding: "10px 14px",
          borderRadius: "var(--radius-md, 8px)",
          background: "var(--color-surface, #FFFFFF)",
          border: "1px solid var(--color-border, #E0E0E6)",
          color: "var(--color-fg, #1A1A2E)",
          fontSize: "14px",
          fontFamily: "inherit",
          width: "100%",
          resize: "vertical",
          boxSizing: "border-box",
          lineHeight: 1.45,
          outline: "none",
        }}
        onFocus={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor =
            "var(--color-accent, #3B5CCC)";
          (e.target as HTMLTextAreaElement).style.boxShadow =
            "0 0 0 3px rgba(59,92,204,0.15)";
        }}
        onBlur={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor =
            "var(--color-border, #E0E0E6)";
          (e.target as HTMLTextAreaElement).style.boxShadow = "none";
        }}
      />
      {error && (
        <p
          style={{
            color: "var(--color-danger, #D93B48)",
            fontSize: "13px",
          }}
        >
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md, 8px)",
            background: "var(--color-accent, #3B5CCC)",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            minHeight: "44px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.45 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              (e.target as HTMLButtonElement).style.background = "#4F6DD4";
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              (e.target as HTMLButtonElement).style.background =
                "var(--color-accent, #3B5CCC)";
            }
          }}
        >
          {saving ? "Hinzufügen..." : "Hinzufügen"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md, 8px)",
            background: "transparent",
            color: "var(--color-accent, #3B5CCC)",
            fontWeight: 600,
            fontSize: "14px",
            border: "1px solid var(--color-border, #E0E0E6)",
            minHeight: "44px",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.45 : 1,
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              (e.target as HTMLButtonElement).style.background = "#F0F1F8";
              (e.target as HTMLButtonElement).style.borderColor =
                "var(--color-accent, #3B5CCC)";
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              (e.target as HTMLButtonElement).style.background = "transparent";
              (e.target as HTMLButtonElement).style.borderColor =
                "var(--color-border, #E0E0E6)";
            }
          }}
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default CreateCardForm;
