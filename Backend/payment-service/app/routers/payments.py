from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo import ReturnDocument

from app.database import get_db
from app.messaging import PaymentEventPublisher, get_payment_event_publisher
from app.schemas import PaymentCreate, PaymentOut, PaymentStatus

router = APIRouter(prefix="/payments", tags=["Payments"])


def to_out(doc: dict) -> PaymentOut:
    doc["id"] = str(doc.pop("_id"))
    return PaymentOut(**doc)


def check_id(payment_id: str) -> ObjectId:
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(status_code=400, detail="Identifiant de paiement invalide")
    return ObjectId(payment_id)


async def change_status(
    db,
    payment_id: str,
    from_status: PaymentStatus,
    to_status: PaymentStatus,
    event_publisher: PaymentEventPublisher,
):
    oid = check_id(payment_id)
    doc = await db.payments.find_one_and_update(
        {"_id": oid, "status": from_status.value},
        {"$set": {"status": to_status.value, "updated_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    if doc is None:
        if await db.payments.find_one({"_id": oid}) is None:
            raise HTTPException(status_code=404, detail="Paiement introuvable")
        raise HTTPException(
            status_code=409,
            detail=f"Transition impossible : le paiement n'est pas en statut {from_status.value}",
        )
    payment = to_out(doc)
    event_type = {
        PaymentStatus.PAID: "payment.confirmed",
        PaymentStatus.FAILED: "payment.failed",
        PaymentStatus.REFUNDED: "payment.refunded",
    }[to_status]
    await event_publisher.publish(event_type, payment.model_dump(mode="json"))
    return payment


@router.post("", response_model=PaymentOut, status_code=201, summary="Initier un paiement")
async def create_payment(
    data: PaymentCreate,
    db=Depends(get_db),
    event_publisher: PaymentEventPublisher = Depends(get_payment_event_publisher),
):
    existing = await db.payments.find_one(
        {"booking_id": data.booking_id, "status": {"$in": ["PENDING", "PAID"]}}
    )
    if existing:
        raise HTTPException(status_code=409, detail="Un paiement existe déjà pour cette réservation")

    now = datetime.now(timezone.utc)
    doc = {**data.model_dump(mode="json"), "status": "PENDING", "created_at": now, "updated_at": now}
    result = await db.payments.insert_one(doc)
    doc["_id"] = result.inserted_id
    payment = to_out(doc)
    await event_publisher.publish("payment.created", payment.model_dump(mode="json"))
    return payment


@router.get("", response_model=list[PaymentOut], summary="Lister les paiements")
async def list_payments(
    booking_id: str | None = None,
    passenger_id: str | None = None,
    status: PaymentStatus | None = None,
    limit: int = Query(50, le=200),
    db=Depends(get_db),
):
    query = {}
    if booking_id:
        query["booking_id"] = booking_id
    if passenger_id:
        query["passenger_id"] = passenger_id
    if status:
        query["status"] = status.value
    cursor = db.payments.find(query).sort("created_at", -1).limit(limit)
    return [to_out(d) async for d in cursor]


@router.get("/{payment_id}", response_model=PaymentOut, summary="Détail d'un paiement")
async def get_payment(payment_id: str, db=Depends(get_db)):
    doc = await db.payments.find_one({"_id": check_id(payment_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Paiement introuvable")
    return to_out(doc)


@router.post("/{payment_id}/confirm", response_model=PaymentOut, summary="Confirmer (simulation)")
async def confirm_payment(
    payment_id: str,
    db=Depends(get_db),
    event_publisher: PaymentEventPublisher = Depends(get_payment_event_publisher),
):
    return await change_status(db, payment_id, PaymentStatus.PENDING, PaymentStatus.PAID, event_publisher)


@router.post("/{payment_id}/fail", response_model=PaymentOut, summary="Marquer comme échoué")
async def fail_payment(
    payment_id: str,
    db=Depends(get_db),
    event_publisher: PaymentEventPublisher = Depends(get_payment_event_publisher),
):
    return await change_status(db, payment_id, PaymentStatus.PENDING, PaymentStatus.FAILED, event_publisher)


@router.post("/{payment_id}/refund", response_model=PaymentOut, summary="Rembourser")
async def refund_payment(
    payment_id: str,
    db=Depends(get_db),
    event_publisher: PaymentEventPublisher = Depends(get_payment_event_publisher),
):
    return await change_status(db, payment_id, PaymentStatus.PAID, PaymentStatus.REFUNDED, event_publisher)