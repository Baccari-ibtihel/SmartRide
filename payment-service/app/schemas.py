from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class PaymentMethod(str, Enum):
    CARD = "CARD"
    CASH = "CASH"
    WALLET = "WALLET"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentCreate(BaseModel):
    booking_id: str
    passenger_id: str
    driver_id: str
    amount: float = Field(gt=0, description="Montant du trajet")
    currency: str = "TND"
    method: PaymentMethod

    model_config = {
        "json_schema_extra": {
            "example": {
                "booking_id": "bk_1001",
                "passenger_id": "usr_12",
                "driver_id": "usr_34",
                "amount": 15.5,
                "currency": "TND",
                "method": "CARD",
            }
        }
    }

class PaymentOut(PaymentCreate):
    id: str
    status: PaymentStatus
    created_at: datetime
    updated_at: datetime