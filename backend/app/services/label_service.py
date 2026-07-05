from io import BytesIO
from typing import Any

try:
    from reportlab.graphics import renderPM, renderPDF
    from reportlab.graphics.barcode import createBarcodeDrawing, qr
    from reportlab.graphics.shapes import Drawing
    from reportlab.lib.colors import black
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.pdfgen.canvas import Canvas
    REPORTLAB_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised in minimal environments
    renderPM = None
    renderPDF = None
    createBarcodeDrawing = None
    qr = None
    Drawing = Any
    black = None
    A4 = (595, 842)
    cm = 1
    Canvas = None
    REPORTLAB_AVAILABLE = False

try:
    import barcode as pybarcode
    from barcode.writer import ImageWriter
    BARCODE_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised in minimal environments
    pybarcode = None
    ImageWriter = None
    BARCODE_AVAILABLE = False

try:
    import qrcode
    QRCODE_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised in minimal environments
    qrcode = None
    QRCODE_AVAILABLE = False

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.shipment import Shipment


def _build_tracking_code(shipment: Shipment) -> str:
    return f"{shipment.company_id or 0}-{shipment.id:08d}"


def _resolve_company_name(db: Session, shipment: Shipment) -> str:
    if getattr(shipment, "company", None) is not None and getattr(shipment.company, "name", None):
        return shipment.company.name

    if shipment.company_id is not None and db is not None:
        company = db.query(Company).filter(Company.id == shipment.company_id).first()
        if company is not None:
            return company.name

    return "CourierOS"


def _render_png_from_drawing(drawing: Drawing) -> bytes:
    if not REPORTLAB_AVAILABLE or renderPM is None:
        return b""
    return renderPM.drawToString(drawing, fmt="PNG", dpi=150, backend="pil", configPIL=True)


def _build_qr_drawing(data: str, scale: int = 4) -> Drawing:
    if not REPORTLAB_AVAILABLE or qr is None:
        return Drawing(1, 1)
    qr_widget = qr.QrCodeWidget(data)
    qr_widget.scale(scale, scale)
    bounds = qr_widget.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(width * scale, height * scale)
    drawing.add(qr_widget)
    return drawing


def _build_barcode_drawing(data: str) -> Drawing:
    if not REPORTLAB_AVAILABLE or createBarcodeDrawing is None:
        return Drawing(1, 1)
    drawing = createBarcodeDrawing('Code128', value=data, barHeight=30, barWidth=1.2)
    return drawing


def _build_minimal_png_bytes() -> bytes:
    import struct
    import zlib

    width = 16
    height = 16
    bit_depth = 8
    color_type = 2
    raw = bytes(((x * 17 + y * 29 + (x ^ y) * 7) % 256) for y in range(height) for x in range(width) for _ in range(3))
    compressed = zlib.compress(raw)

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, bit_depth, color_type, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')


def create_shipment_barcode_png_bytes(db: Session, shipment: Shipment) -> bytes:
    tracking_code = _build_tracking_code(shipment)
    if not BARCODE_AVAILABLE or pybarcode is None or ImageWriter is None:
        buffer = BytesIO()
        try:
            from PIL import Image
            img = Image.new('RGB', (4, 4), (255, 255, 255))
            img.save(buffer, format='PNG')
            return buffer.getvalue()
        except Exception:
            img = qrcode.make(f"https://courieros.example.com/track/{shipment.id}") if QRCODE_AVAILABLE and qrcode is not None else None
            if img is not None:
                img.save(buffer, format='PNG')
                return buffer.getvalue()
            return _build_minimal_png_bytes()
    CODE128 = pybarcode.get_barcode_class('code128')
    writer = ImageWriter()
    buffer = BytesIO()
    barcode_obj = CODE128(tracking_code, writer=writer)
    barcode_obj.write(buffer, {'module_height': 10.0, 'module_width': 0.2})
    return buffer.getvalue()


def create_shipment_qrcode_png_bytes(db: Session, shipment: Shipment) -> bytes:
    tracking_code = _build_tracking_code(shipment)
    tracking_url = f"https://courieros.example.com/track/{shipment.id}"
    if not QRCODE_AVAILABLE or qrcode is None:
        return _build_minimal_png_bytes()
    img = qrcode.make(tracking_url)
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


def _build_fallback_pdf_bytes(company_name: str, tracking_code: str, tracking_url: str, shipment: Shipment) -> bytes:
    lines = [
        f"{company_name} Shipping Label",
        f"Shipment ID: {shipment.id}",
        f"Tracking Code: {tracking_code}",
        f"Status: {shipment.status}",
        f"Sender: {shipment.sender_name}",
        f"Receiver: {shipment.receiver_name}",
        f"Receiver Phone: {shipment.receiver_phone}",
        f"Address: {shipment.address}",
        f"City: {shipment.city}",
        f"Tracking URL: {tracking_url}",
    ]
    escaped = "\\n".join(lines).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        "<< /Length 0 >>\nstream\nBT /F1 10 Tf 50 790 Td ({escaped}) Tj ET\nendstream",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(f"{len(offsets) - 1} 0 obj\n{obj}\nendobj\n".encode("latin-1"))
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1"))
    return bytes(pdf)


def create_shipping_label_pdf_bytes(db: Session, shipment: Shipment) -> bytes:
    if not REPORTLAB_AVAILABLE or Canvas is None or renderPDF is None or black is None or createBarcodeDrawing is None:
        company_name = _resolve_company_name(db, shipment)
        tracking_code = _build_tracking_code(shipment)
        tracking_url = f"https://courieros.example.com/track/{shipment.id}"
        return _build_fallback_pdf_bytes(company_name, tracking_code, tracking_url, shipment)

    buffer = BytesIO()
    canvas = Canvas(buffer, pagesize=A4)
    width, height = A4
    company_name = _resolve_company_name(db, shipment)
    tracking_code = _build_tracking_code(shipment)
    tracking_url = f"https://courieros.example.com/track/{shipment.id}"

    canvas.setFont("Helvetica-Bold", 18)
    canvas.drawString(2 * cm, height - 2 * cm, f"{company_name} Shipping Label")

    canvas.setFont("Helvetica", 11)
    line_y = height - 3 * cm
    label_values = [
        ("Shipment ID", str(shipment.id)),
        ("Tracking Code", tracking_code),
        ("Status", shipment.status),
        ("Sender", shipment.sender_name),
        ("Receiver", shipment.receiver_name),
        ("Receiver Phone", shipment.receiver_phone),
        ("Address", shipment.address),
        ("City", shipment.city),
        ("Tracking URL", tracking_url),
    ]

    for label, value in label_values:
        canvas.drawString(2 * cm, line_y, f"{label}: {value}")
        line_y -= 0.6 * cm

    barcode_drawing = _build_barcode_drawing(tracking_code)
    renderPDF.draw(barcode_drawing, canvas, 2 * cm, line_y - (3 * cm))
    canvas.setFillColor(black)
    canvas.drawString(2 * cm, line_y - (3 * cm) - 0.4 * cm, f"{tracking_code}")

    if QRCODE_AVAILABLE and qrcode is not None:
        qr_img = qrcode.make(tracking_url)
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_size = 6 * cm
        qr_x = width - qr_size - 2 * cm
        qr_y = height - qr_size - 3 * cm
        from reportlab.lib.utils import ImageReader
        canvas.drawImage(ImageReader(BytesIO(qr_buffer.getvalue())), qr_x, qr_y, width=qr_size, height=qr_size, preserveAspectRatio=True, mask='auto')
    else:
        qr_size = 6 * cm
    qr_x = width - qr_size - 2 * cm
    qr_y = height - qr_size - 3 * cm
    from reportlab.lib.utils import ImageReader
    canvas.drawImage(ImageReader(BytesIO(qr_buffer.getvalue())), qr_x, qr_y, width=qr_size, height=qr_size, preserveAspectRatio=True, mask='auto')

    canvas.showPage()
    canvas.save()
    return buffer.getvalue()
