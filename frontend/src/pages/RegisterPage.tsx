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

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  function validate(): boolean {
    const errors: string[] = [];
    if (!email.trim()) {
      errors.push("Bitte gib deine E-Mail-Adresse ein");
    } else if (!emailRegex.test(email.trim())) {
      errors.push("Bitte gib eine gültige E-Mail-Adresse ein");
    }
    if (!password) {
      errors.push("Bitte gib ein Passwort ein");
    } else if (password.length < 8) {
      errors.push("Das Passwort muss mindestens 8 Zeichen lang sein");
    }
    setFieldErrors(errors);
    return errors.length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password);
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

  const hasFieldErrors = fieldErrors.length > 0;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Registrieren</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="register-email">
              E-Mail
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              style={{
                ...inputStyle,
                ...(hasFieldErrors
                  ? {
                      borderColor: "var(--color-danger)",
                      boxShadow: "0 0 0 3px rgba(217,59,72,0.15)",
                    }
                  : {}),
              }}
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle} htmlFor="register-password">
              Passwort
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              style={{
                ...inputStyle,
                ...(hasFieldErrors
                  ? {
                      borderColor: "var(--color-danger)",
                      boxShadow: "0 0 0 3px rgba(217,59,72,0.15)",
                    }
                  : {}),
              }}
            />
          </div>
          {fieldErrors.map((msg, i) => (
            <div key={i} style={errorStyle}>
              {msg}
            </div>
          ))}
          {error && <div style={errorStyle}>{error}</div>}
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Wird registriert..." : "Registrieren"}
          </button>
        </form>
        <div style={footerStyle}>
          Bereits registriert?{" "}
          <Link to="/login" style={linkStyle}>
            Jetzt anmelden
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
