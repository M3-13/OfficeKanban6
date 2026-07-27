from __future__ import annotations

import os
import tempfile


def pytest_configure() -> None:
    test_db = os.path.join(tempfile.gettempdir(), "kanban_test.db")
    if os.path.exists(test_db):
        os.remove(test_db)
    os.environ["DB_PATH"] = test_db
