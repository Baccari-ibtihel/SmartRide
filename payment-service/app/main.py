import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pymongo import AsyncMongoClient
from py_eureka_client.eureka_client import EurekaClient

from app.config import settings
from app.messaging import PaymentEventPublisher
from app.routers import payments

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncMongoClient(settings.mongo_uri)
    app.state.db = client[settings.mongo_db]
    await app.state.db.payments.create_index("booking_id")

    eureka_client = None
    if settings.eureka_enabled and settings.eureka_server:
        eureka_client = EurekaClient(
            eureka_server=settings.eureka_server,
            app_name=settings.eureka_app_name,
            instance_host=settings.eureka_instance_host,
            instance_port=settings.eureka_instance_port,
            health_check_url="/health",
            should_discover=False,
        )
        try:
            await eureka_client.start()
        except Exception as exc:  # pragma: no cover - exercised via integration test
            logger.warning(
                "Eureka server unavailable at %s; continuing without registration: %s",
                settings.eureka_server,
                exc,
            )

    event_publisher = PaymentEventPublisher(settings.rabbitmq_url)
    try:
        await event_publisher.start()
        app.state.payment_event_publisher = event_publisher
        yield
    finally:
        await event_publisher.close()
        if eureka_client is not None:
            await eureka_client.stop()
        await client.close()


app = FastAPI(
    title="SmartRide - Payment Service",
    description="Microservice de paiement en ligne de la plateforme SmartRide",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(payments.router)


@app.get("/health", tags=["Monitoring"], include_in_schema=False)
async def health():
    return {"status": "UP", "service": "payment-service"}