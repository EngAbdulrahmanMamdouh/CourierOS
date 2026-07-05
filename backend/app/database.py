from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema():
    inspector = inspect(engine)
    if "shipments" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("shipments")}
    if "owner_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN owner_id INTEGER"))
            result = connection.execute(text("SELECT id FROM users ORDER BY id LIMIT 1")).fetchone()
            default_owner_id = result[0] if result else 1
            connection.execute(text("UPDATE shipments SET owner_id = :owner_id WHERE owner_id IS NULL"), {"owner_id": default_owner_id})

    if "is_deleted" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN is_deleted BOOLEAN DEFAULT 0 NOT NULL"))
            connection.execute(text("UPDATE shipments SET is_deleted = 0 WHERE is_deleted IS NULL"))

    if "deleted_at" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN deleted_at DATETIME"))

    if "estimated_delivery_days" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN estimated_delivery_days INTEGER DEFAULT 1 NOT NULL"))
            connection.execute(text("UPDATE shipments SET estimated_delivery_days = 1 WHERE estimated_delivery_days IS NULL"))

    if "delivered_at" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN delivered_at DATETIME"))

    if "customer_id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE shipments ADD COLUMN customer_id INTEGER"))


ensure_schema()

