import os
from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

# PUBLIC_INTERFACE
def get_database_url() -> str:
    """Return SQLAlchemy database URL from environment variables.

    Expected environment variables:
    - POSTGRES_HOST
    - POSTGRES_PORT
    - POSTGRES_DB
    - POSTGRES_USER
    - POSTGRES_PASSWORD

    If DATABASE_URL is set, that will be used directly. Otherwise, a URL is constructed.
    """
    # Prefer a full DATABASE_URL if provided (e.g. for cloud providers)
    configured = os.getenv("DATABASE_URL")
    if configured:
        return configured

    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "career_navigator")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"


DATABASE_URL = get_database_url()

# Create the SQLAlchemy engine
# NullPool avoids connection reuse issues in some serverless/dev environments
engine = create_engine(DATABASE_URL, poolclass=NullPool, future=True)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


# PUBLIC_INTERFACE
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency to provide a SQLAlchemy Session per-request.

    Yields:
        sqlalchemy.orm.Session: Database session for the current request context.
    """
    db: Optional[Session] = None
    try:
        db = SessionLocal()
        yield db
    finally:
        if db is not None:
            db.close()
