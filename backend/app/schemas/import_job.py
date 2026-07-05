from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ImportJobBase(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    status: str = "Pending"
    total_rows: int = 0
    imported_rows: int = 0
    failed_rows: int = 0
    duplicate_rows: int = 0
    started_at: datetime | None = None
    finished_at: datetime | None = None
    report: str | None = None


class ImportJobCreate(ImportJobBase):
    pass


class ImportJobUpdate(BaseModel):
    status: str | None = None
    imported_rows: int | None = None
    failed_rows: int | None = None
    report: str | None = None


class ImportJobResponse(ImportJobBase):
    id: int
    uploaded_by: int
    created_at: datetime
    original_filename: str | None = None
    uploaded_time: datetime
    finished_time: datetime | None = None
    duration_seconds: float | None = None

    model_config = ConfigDict(from_attributes=True)


class ImportSummaryResponse(BaseModel):
    import_job_id: int
    total_rows: int
    imported_rows: int
    failed_rows: int
    duplicate_rows: int
    success_percentage: float
    failure_percentage: float
    duplicate_percentage: float
    duration_seconds: float | None
    status: str
    uploaded_by: int
    uploaded_time: datetime
    finished_time: datetime | None


class ImportExecutionResponse(BaseModel):
    total_rows: int
    successful_rows: int
    failed_rows: int
    duplicate_rows: int
    validation_errors: list[dict[str, Any]]
    created_shipment_ids: list[int]
    execution_time: float
    import_job_id: int


class ImportPreviewRow(BaseModel):
    row_number: int
    validation_status: str
    validation_errors: list[str]
    mapped_data: dict[str, Any]


class ImportPreviewResponse(BaseModel):
    detected_columns: list[str]
    missing_required_columns: list[str]
    preview_rows: list[ImportPreviewRow]
    total_rows: int


class ImportReportResponse(BaseModel):
    report_url: str
