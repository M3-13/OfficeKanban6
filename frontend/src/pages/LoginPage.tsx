import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  padding: "var(--space-4)",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  backgroundColor: "var(--color-surface)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: "var(--color-fg)",
  marginBottom: "var(--space-4)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--color-fg)",
  marginBottom: "var(--space-1)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize: 14,
  fontFamily: "inherit",
  color: "var(--color-fg)",
  backgroundColor: "var(--color-surface)",
  minHeight: 48,
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const groupStyle: React.CSSProperties = {
  marginBottom: "var(--space-3)",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 20px",
  borderRadius: "var(--radius-md)",
  border: "none",
  backgroundColor: "var(--color-accent)",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  minHeight: 48,
  marginTop: "var(--space-1)",
};

const errorStyle: React.CSSProperties = {
  color: "var(--color-danger)",
  fontSize: 13,
  marginTop: "var(--space-2)",
};

const footerStyle: React.CSSProperties = {
  marginTop: "var(--space-4)",
  fontSize: 14,
  color: "var(--color-muted)",
  textAlign: "center",
};

const linkStyle: React.CSSProperties = {
  color: "var(--color-accent)",
  fontWeight: 600,
  textDecoration: "none",
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  function validate(): boolean {
    if (!email.trim()) {
      setFieldError("Bitte gib deine E-Mail-Adresse ein");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setFieldError("Bitte gib eine gültige E-Mail-Adresse ein");
      return false;
    }
    if (!password) {
      setFieldError("Bitte gib dein Passwort ein");
      return false;
    }
    setFieldError("");
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Anmelden</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="login-email">
              E-Mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              style={{
                ...inputStyle,
                ...(fieldError
                  ? {
                      borderColor: "var(--color-danger)",
                      boxShadow: "0 0 0 3px rgba(217,59,72,0.15)",
                    }
                  : {}),
              }}
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="login-password">
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                ...inputStyle,
                ...(fieldError
                  ? {
                      borderColor: "var(--color-danger)",
                      boxShadow: "0 0 0 3px rgba(217,59,72,0.15)",
                    }
                  : {}),
              }}
            />
          </div>
          {fieldError && <div style={errorStyle}>{fieldError}</div>}
          {error && <div style={errorStyle}>{error}</div>}
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>
        <div style={footerStyle}>
          Noch keinen Account?{" "}
          <Link to="/register" style={linkStyle}>
            Jetzt registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
