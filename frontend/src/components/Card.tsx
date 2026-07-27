import { useState, useCallback } from "react";
import * as cardsApi from "../api/cards";
import type { CardData } from "../api/cards";

interface CardProps {
  card: CardData;
  onUpdate?: (card: CardData) => void;
  onDelete?: (cardId: number) => void;
}

function Card({ card, onUpdate, onDelete }: CardProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [currentCard, setCurrentCard] = useState<CardData>(card);

  const openModal = useCallback(() => {
    setTitle(currentCard.title);
    setDescription(currentCard.description);
    setError("");
    setConfirmDelete(false);
    setShowModal(true);
  }, [currentCard]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setConfirmDelete(false);
    setError("");
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      setDragging(true);
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: currentCard.id,
          column_id: currentCard.column_id,
          position: currentCard.position,
          title: currentCard.title,
          description: currentCard.description,
        }),
      );
      e.dataTransfer.effectAllowed = "move";
    },
    [currentCard],
  );

  const handleDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const handleSave = useCallback(
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
        const updated = await cardsApi.updateCard(
          currentCard.id,
          trimmedTitle,
          description,
        );
        setCurrentCard(updated);
        onUpdate?.(updated);
        setShowModal(false);
      } catch {
        setError("Speichern fehlgeschlagen");
      } finally {
        setSaving(false);
      }
    },
    [title, description, currentCard.id, onUpdate],
  );

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError("");
    try {
      await cardsApi.deleteCard(currentCard.id);
      onDelete?.(currentCard.id);
      setShowModal(false);
    } catch {
      setError("Löschen fehlgeschlagen");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [currentCard.id, onDelete]);

  const descPreview = currentCard.description
    ? currentCard.description.length > 80
      ? currentCard.description.slice(0, 80) + "\u2026"
      : currentCard.description
    : null;

  return (
    <>
      <div
        className={`card${dragging ? " card--dragging" : ""}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
        style={{
          background: "var(--color-surface, #FFFFFF)",
          border: dragging
            ? "1px solid var(--color-accent, #3B5CCC)"
            : "1px solid var(--color-border, #E0E0E6)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "14px 16px",
          boxShadow: dragging
            ? "0 8px 24px rgba(0,0,0,0.14)"
            : "0 1px 2px rgba(0,0,0,0.04)",
          cursor: dragging ? "grabbing" : "pointer",
          transform: dragging ? "rotate(2deg)" : "none",
          opacity: dragging ? 0.5 : 1,
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          textAlign: "left",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          if (!dragging && !showModal) {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 4px 12px rgba(0,0,0,0.08)";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "#C8CCD8";
          }
        }}
        onMouseLeave={(e) => {
          if (!dragging && !showModal) {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 1px 2px rgba(0,0,0,0.04)";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "var(--color-border, #E0E0E6)";
          }
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--color-fg, #1A1A2E)",
            marginBottom: descPreview ? "4px" : 0,
            wordBreak: "break-word",
          }}
        >
          {currentCard.title}
        </div>
        {descPreview && (
          <div
            style={{
              fontSize: "13px",
              color: "var(--color-muted, #8E8E9A)",
              lineHeight: 1.45,
              wordBreak: "break-word",
            }}
          >
            {descPreview}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface, #FFFFFF)",
              borderRadius: "var(--radius-lg, 12px)",
              padding: "var(--space-4, 24px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
              maxWidth: "480px",
              width: "90vw",
            }}
          >
            <h2
              style={{
                fontWeight: 600,
                fontSize: "20px",
                marginBottom: "var(--space-3, 16px)",
                color: "var(--color-fg, #1A1A2E)",
              }}
            >
              Karte bearbeiten
            </h2>
            <form onSubmit={handleSave}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-muted, #8E8E9A)",
                  marginBottom: "var(--space-0, 4px)",
                }}
              >
                Titel
              </label>
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
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-muted, #8E8E9A)",
                  marginBottom: "var(--space-0, 4px)",
                  marginTop: "var(--space-2, 12px)",
                }}
              >
                Beschreibung
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError("");
                }}
                maxLength={2000}
                rows={5}
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
                    marginTop: "var(--space-1, 8px)",
                  }}
                >
                  {error}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "var(--space-4, 24px)",
                }}
              >
                <div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "var(--radius-md, 8px)",
                        background: "var(--color-danger, #D93B48)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "14px",
                        border: "none",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.background =
                          "#E0505C";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.background =
                          "var(--color-danger, #D93B48)";
                      }}
                    >
                      Löschen
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--color-danger, #D93B48)",
                        }}
                      >
                        Wirklich löschen?
                      </span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-md, 8px)",
                          background: "var(--color-danger, #D93B48)",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          fontSize: "13px",
                          border: "none",
                          minHeight: "36px",
                          cursor: deleting ? "not-allowed" : "pointer",
                          opacity: deleting ? 0.45 : 1,
                        }}
                      >
                        {deleting ? "..." : "Ja"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        disabled={deleting}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-md, 8px)",
                          background: "transparent",
                          color: "var(--color-accent, #3B5CCC)",
                          fontWeight: 600,
                          fontSize: "13px",
                          border: "1px solid var(--color-border, #E0E0E6)",
                          minHeight: "36px",
                          cursor: deleting ? "not-allowed" : "pointer",
                          opacity: deleting ? 0.45 : 1,
                        }}
                      >
                        Nein
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={closeModal}
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
                    {saving ? "Speichern..." : "Speichern"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;
