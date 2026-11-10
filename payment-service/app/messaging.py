import json
from datetime import datetime, timezone
from uuid import uuid4

import aio_pika
from fastapi import Request


class PaymentEventPublisher:
    def __init__(self, url: str):
        self.url = url
        self.connection = None
        self.exchange = None

    async def start(self):
        self.connection = await aio_pika.connect_robust(self.url, timeout=10)
        channel = await self.connection.channel(publisher_confirms=True)
        self.exchange = await channel.declare_exchange(
            "payment.events",
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        queue = await channel.declare_queue("payment.events", durable=True)
        await queue.bind(self.exchange, routing_key="payment.#")

    async def publish(self, event_type: str, payment: dict):
        if self.exchange is None:
            raise RuntimeError("RabbitMQ publisher is not started")

        event = {
            "event_id": str(uuid4()),
            "event_type": event_type,
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "data": payment,
        }
        message = aio_pika.Message(
            body=json.dumps(event).encode("utf-8"),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            message_id=event["event_id"],
            type=event_type,
        )
        await self.exchange.publish(message, routing_key=event_type, mandatory=True)

    async def close(self):
        if self.connection is not None:
            await self.connection.close()


def get_payment_event_publisher(request: Request) -> PaymentEventPublisher:
    return request.app.state.payment_event_publisher