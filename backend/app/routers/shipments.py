from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Body
from starlette.responses import StreamingResponse
from typing import List
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import get_current_user

from app.schemas.shipment import ShipmentCreate, ShipmentResponse
from app.crud import shipment as shipment_crud

from app.models.shipment_history import ShipmentHistory
from app.models.shipment_status import ShipmentStatus
from app.models.user import User
from app.services.audit_service import log_event
from app.services.label_service import (
    create_shipping_label_pdf_bytes,
    create_shipment_barcode_png_bytes,
    create_shipment_qrcode_png_bytes,
)
from app.services.shipment_service import update_shipment_status as update_status_service
from app.services.notification_service import create_notification
from app.crud import finance as finance_crud
from app.schemas.finance import CodCollectionResponse

router = APIRouter(
    prefix="/shipments",
    tags=["Shipments"]
)


@router.get("/", response_model=List[ShipmentResponse])
def get_shipments(
    page: int = 1,
    size: int = 10,
    include_deleted: bool = False,
    search: str | None = None,
    status: str | None = None,
    city: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shipment_crud.get_all_shipments(
        db=db,
        page=page,
        size=size,
        current_user=current_user,
        include_deleted=include_deleted,
        search=search,
        status=status,
        city=city,
    )

@router.get("/dashboard")
def dashboard(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shipment_crud.get_dashboard_statistics(db, current_user=current_user, include_deleted=include_deleted)


@router.get("/dashboard/summary")
def dashboard_summary(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shipment_crud.get_dashboard_summary(db, current_user=current_user, include_deleted=include_deleted)


@router.get("/reports/shipments")
def reports_shipments(
    date_from: str | None = None,
    date_to: str | None = None,
    status: str | None = None,
    city: str | None = None,
    user_id: int | None = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return shipment_crud.get_reports_shipments(
        db=db,
        current_user=current_user,
        date_from=date_from,
        date_to=date_to,
        status=status,
        city=city,
        user_id=user_id,
        include_deleted=include_deleted,
    )


@router.get("/search")
def search_shipments(
    city: str = None,
    status: str = None,
    receiver_name: str = None,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return shipment_crud.search_shipments(
        db=db,
        city=city,
        status=status,
        receiver_name=receiver_name,
        current_user=current_user,
        include_deleted=include_deleted,
    )


@router.get("/track/{shipment_id}")
def track_shipment(
    shipment_id: int,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user, include_deleted=include_deleted)

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    history = shipment_crud.get_shipment_history(db, shipment_id, current_user=current_user)

    return {
        "shipment_id": shipment.id,
        "current_status": shipment.status,
        "sender": shipment.sender_name,
        "receiver": shipment.receiver_name,
        "receiver_phone": shipment.receiver_phone,
        "address": shipment.address,
        "city": shipment.city,
        "history": history
    }


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: int,
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user, include_deleted=include_deleted)

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    return shipment


@router.get("/{shipment_id}/label")
def download_shipment_label(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user)
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")

    pdf_bytes = create_shipping_label_pdf_bytes(db=db, shipment=shipment)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=shipment_{shipment.id}_label.pdf"},
    )


@router.get("/{shipment_id}/barcode")
def download_shipment_barcode(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user)
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")

    png_bytes = create_shipment_barcode_png_bytes(db=db, shipment=shipment)

    return StreamingResponse(
        BytesIO(png_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=shipment_{shipment.id}_barcode.png"},
    )


@router.get("/{shipment_id}/qrcode")
def download_shipment_qrcode(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user)
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")

    png_bytes = create_shipment_qrcode_png_bytes(db=db, shipment=shipment)

    return StreamingResponse(
        BytesIO(png_bytes),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=shipment_{shipment.id}_qrcode.png"},
    )


@router.post("/")
def create_shipment(
    shipment: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_shipment = shipment_crud.create_shipment(db, shipment, owner_id=current_user.id, company_id=current_user.company_id or 1, current_user=current_user)

    log_event(
        db=db,
        actor_id=current_user.id,
        action="created",
        entity="shipment",
        entity_id=new_shipment.id,
        description="Shipment created",
    )

    create_notification(
        db=db,
        user_id=current_user.id,
        message=f"Shipment #{new_shipment.id} created successfully",
        current_user=current_user,
    )

    return {
        "message": "Shipment created successfully",
        "data": ShipmentResponse.model_validate(new_shipment)
    }


@router.put("/{shipment_id}")
def update_shipment(
    shipment_id: int,
    shipment: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = shipment_crud.update_shipment(
        db,
        shipment_id,
        shipment,
        current_user=current_user,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    return updated

@router.patch("/{shipment_id}/assign")
def assign_shipment(
    shipment_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipment = shipment_crud.assign_shipment(db, shipment_id, employee_id, current_user=current_user)

    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")

    create_notification(
        db=db,
        user_id=current_user.id,
        message=f"Shipment #{shipment.id} assigned to employee #{employee_id}",
        current_user=current_user,
    )

    return {
        "message": "Shipment assigned successfully",
        "shipment_id": shipment.id,
        "assigned_to": shipment.assigned_to,
    }


@router.patch("/{shipment_id}/status")
def update_shipment_status(
    shipment_id: int,
    new_status: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        new_status_enum = ShipmentStatus(new_status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid status value")

    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user)

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    result = update_status_service(
        db=db,
        shipment=shipment,
        new_status=new_status_enum,
        current_user=current_user
    )

    create_notification(
        db=db,
        user_id=current_user.id,
        message=f"Shipment #{shipment.id} status updated to {new_status_enum.value}",
        current_user=current_user,
    )

    return result


@router.get("/{shipment_id}/history")
def get_history(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = shipment_crud.get_shipment_by_id(db, shipment_id, current_user=current_user)

    if shipment is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    return shipment_crud.get_shipment_history(db, shipment_id, current_user=current_user)


@router.delete("/{shipment_id}")
def delete_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = shipment_crud.delete_shipment(db, shipment_id, current_user=current_user)

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    log_event(
        db=db,
        actor_id=current_user.id,
        action="deleted",
        entity="shipment",
        entity_id=shipment_id,
        description="Shipment deleted",
    )

    return {
        "message": "Shipment deleted successfully"
    }


@router.post("/{shipment_id}/cod-collection", response_model=CodCollectionResponse)
def collect_shipment_cod(
    shipment_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return finance_crud.collect_cod(db, shipment_id, payload, current_user=current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

