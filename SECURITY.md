VERDICT: BLOCKED

## Sicherheitsbericht

### 1. Hardcoded default JWT-Secret (Kritisch)
- **Datei:** `backend/config.py`
- **Stelle:** `SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")`
- **Beschreibung:** Der JWT‑Signierschlüssel fällt auf einen statischen, öffentlich bekannten String zurück, falls die Umgebungsvariable `SECRET_KEY` nicht gesetzt ist. Damit kann ein Angreifer ohne das echte Secret gültige JWTs für beliebige Benutzer ausstellen und sich unautorisierten Zugriff verschaffen. Dies verstößt direkt gegen die Akzeptanzkriterien, die ein ausschließliches Laden aus einer Umgebungsvariable ohne jeglichen Code-Fallback fordern.
- **Auswirkung:** Kompromittierung aller Authentifizierungsmechanismen, vollständige Umgehung der Benutzerisolation.
- **Behebung:** Entfernen Sie den Default-Wert und brechen Sie den Start mit einer aussagekräftigen Fehlermeldung ab, wenn `SECRET_KEY` nicht gesetzt ist:
  ```python
  import sys
  SECRET_KEY = os.getenv("SECRET_KEY")
  if not SECRET_KEY:
      sys.exit("FATAL: SECRET_KEY environment variable is required")
  ```

### 2. JWT‑Token im localStorage gespeichert (Mittel)
- **Datei:** `frontend/src/context/AuthContext.tsx`
- **Stelle:** `localStorage.setItem("token", result.access_token)` und `localStorage.getItem("token")`
- **Beschreibung:** Der JWT wird im `localStorage` abgelegt, der für JavaScript-Code lesbar ist. Sollte eine XSS‑Lücke auftreten, kann der Token leicht abgegriffen werden. Die Anwendung selbst weist keine XSS‑Schwachstellen auf, dennoch folgt die Speicherung nicht dem Stand der Technik für vertrauliche Tokens.
- **Empfehlung:** Lagern Sie den Token in einem `httpOnly`‑Cookie (serverseitig gesetzt bei Login) aus und validieren Sie ihn im Backend per `Cookie‑` anstelle von `Authorization‑Header`. Dies würde den Token vor clientseitigem Zugriff schützen.

---

### Zusätzliche Anmerkungen

- **Scanner‑Gap:** `bandit` und `semgrep` wurden im Build‑Pipeline nicht ausgeführt (`[skipped]`). Aus dem fehlenden Scanner‑Output lässt sich keine Vulnerabilität ableiten; eine manuelle Analyse wurde durchgeführt.
- Alle anderen Prüfbereiche (Injection, Validierung, ORM‑Nutzung, Datenisolation, CORS‑Konfiguration, bcrypt‑Hashing) sind solide und weisen keine ausnutzbaren Schwachstellen auf.

Der kritische Fund (hardcoded default secret) macht ein Ausliefern in diesem Zustand nicht vertretbar – daher **BLOCKED**.