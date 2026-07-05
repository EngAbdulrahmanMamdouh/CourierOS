from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.crud import import_job as import_job_crud
from app.services.import_service import create_import_job_record, update_import_job_results
from app.services.audit_service import get_audit_logs


def test_create_import_job_record_and_audit_log():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        current_user = SimpleNamespace(id=1, role="admin")

        job = create_import_job_record(
            db=db,
            file_name="import.xlsx",
            current_user=current_user,
            total_rows=5,
            report="Initial import job record",
        )

        assert job.id is not None
        assert job.file_name == "import.xlsx"
        assert job.status == "Pending"
        assert job.total_rows == 5
        assert job.report == "Initial import job record"

        logs = get_audit_logs(db, entity_type="import_job", entity_id=job.id)
        assert len(logs) == 1
        assert logs[0].action == "create"
    finally:
        db.close()


def test_update_import_job_results_and_soft_delete():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        current_user = SimpleNamespace(id=2, role="employee")

        job = create_import_job_record(
            db=db,
            file_name="import2.xlsx",
            current_user=current_user,
            total_rows=3,
        )

        updated = update_import_job_results(
            db=db,
            job_id=job.id,
            current_user=current_user,
            status="Completed",
            imported_rows=2,
            failed_rows=1,
            report="Import completed with one failed row",
        )

        assert updated is not None
        assert updated.status == "Completed"
        assert updated.imported_rows == 2
        assert updated.failed_rows == 1
        assert "failed row" in updated.report

        deleted = import_job_crud.delete_import_job(db=db, job_id=job.id, current_user=current_user)
        assert deleted is not None
        assert deleted.is_deleted is True
        assert deleted.deleted_at is not None

        remaining = import_job_crud.get_import_job_by_id(db=db, job_id=job.id, current_user=current_user)
        assert remaining is None
    finally:
        db.close()
