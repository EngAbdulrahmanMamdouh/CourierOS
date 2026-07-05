from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models
from app.routers.shipments import router as shipment_router
from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.audit_logs import router as audit_log_router
from app.routers.notifications import router as notification_router
from app.routers.customers import router as customer_router
from app.routers.branches import router as branch_router
from app.routers.drivers import router as driver_router
from app.routers.cities import router as city_router
from app.routers.delivery_zones import router as delivery_zone_router
from app.routers.pricing_rules import router as pricing_rule_router
from app.routers.cods import router as cod_router
from app.routers.payments import router as payment_router
from app.routers.pickup_requests import router as pickup_request_router
from app.routers.shipment_imports import router as shipment_import_router
from app.routers.company import router as company_router
from app.routers.company_settings import router as company_settings_router
from app.routers.dashboard import router as dashboard_router
from app.routers.tracking import router as tracking_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CourierOS API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(PermissionError)
def permission_exception_handler(request: Request, exc: PermissionError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": str(exc)}
    )


@app.exception_handler(ValueError)
def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )


@app.get("/")
def root():
    return {"message": "Welcome to CourierOS API"}


app.include_router(shipment_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(audit_log_router)
app.include_router(notification_router)
app.include_router(customer_router)
app.include_router(branch_router)
app.include_router(driver_router)
app.include_router(city_router)
app.include_router(delivery_zone_router)
app.include_router(pricing_rule_router)
app.include_router(cod_router)
app.include_router(payment_router)
app.include_router(pickup_request_router)
app.include_router(shipment_import_router)
app.include_router(company_router)
app.include_router(company_settings_router)
app.include_router(dashboard_router)
app.include_router(tracking_router)