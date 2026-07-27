import { useState, useEffect, useCallback } from "react";
import { getColumns, type ColumnData } from "../api/columns";
import { useAuth } from "../context/AuthContext";
import Column from "../components/Column";
import CreateColumnForm from "../components/CreateColumnForm";

function BoardPage() {
  const { logout } = useAuth();
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadColumns = useCallback(async () => {
    try {
      setError("");
      const data = await getColumns();
      setColumns(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Laden der Spalten.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColumns();
  }, [loadColumns]);

  function handleColumnCreated(col: ColumnData) {
    setColumns((prev) => [...prev, col]);
  }

  function handleColumnUpdated(updated: ColumnData) {
    setColumns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  }

  function handleColumnDeleted(id: number) {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          height: "56px",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <h1
          style={{
            fontWeight: 600,
            fontSize: "18px",
            color: "var(--color-fg)",
          }}
        >
          OfficeKanban
        </h1>
        <button
          onClick={logout}
          style={{
            fontSize: "14px",
            color: "var(--color-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            minHeight: "44px",
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Logout
        </button>
      </header>

      <main
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "var(--space-2)",
          padding: "var(--space-4)",
          overflowX: "auto",
          alignItems: "flex-start",
          flex: 1,
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {loading ? (
          <div
            style={{
              color: "var(--color-muted)",
              fontSize: "14px",
              padding: "24px",
            }}
          >
            Lade Spalten...
          </div>
        ) : error ? (
          <div
            style={{
              color: "var(--color-danger)",
              fontSize: "14px",
              padding: "24px",
            }}
          >
            {error}
            <button
              onClick={loadColumns}
              style={{
                marginLeft: "var(--space-2)",
                padding: "4px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-accent)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
                minHeight: "32px",
                verticalAlign: "middle",
              }}
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            {columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onUpdate={handleColumnUpdated}
                onDelete={handleColumnDeleted}
              />
            ))}
            <CreateColumnForm onCreated={handleColumnCreated} />
          </>
        )}
      </main>
    </div>
  );
}

export default BoardPage;
