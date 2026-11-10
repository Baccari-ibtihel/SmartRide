import asyncio

from fastapi import FastAPI

from app import main


def test_eureka_client_lifecycle(monkeypatch):
	events = []
	eureka_options = {}

	class FakeCollection:
		async def create_index(self, name):
			events.append(("create_index", name))

	class FakeDatabase:
		payments = FakeCollection()

	class FakeMongoClient:
		def __init__(self, uri):
			self.uri = uri

		def __getitem__(self, name):
			return FakeDatabase()

		async def close(self):
			events.append("mongo_closed")

	class FakeEurekaClient:
		def __init__(self, **kwargs):
			eureka_options.update(kwargs)

		async def start(self):
			events.append("eureka_started")

		async def stop(self):
			events.append("eureka_stopped")

	class FakePaymentEventPublisher:
		def __init__(self, url):
			self.url = url

		async def start(self):
			events.append("rabbitmq_started")

		async def close(self):
			events.append("rabbitmq_closed")

	monkeypatch.setattr(main, "AsyncMongoClient", FakeMongoClient)
	monkeypatch.setattr(main, "EurekaClient", FakeEurekaClient)
	monkeypatch.setattr(main, "PaymentEventPublisher", FakePaymentEventPublisher)

	async def run_lifespan():
		async with main.lifespan(FastAPI()):
			events.append("serving")

	asyncio.run(run_lifespan())

	assert eureka_options["eureka_server"] == main.settings.eureka_server
	assert eureka_options["app_name"] == "payment-service"
	assert eureka_options["instance_port"] == 8004
	assert eureka_options["health_check_url"] == "/health"
	assert eureka_options["should_discover"] is False
	assert events == [
		("create_index", "booking_id"),
		"eureka_started",
		"rabbitmq_started",
		"serving",
		"rabbitmq_closed",
		"eureka_stopped",
		"mongo_closed",
	]


def test_eureka_unavailable_does_not_block_app_start(monkeypatch):
	events = []

	class FakeCollection:
		async def create_index(self, name):
			events.append(("create_index", name))

	class FakeDatabase:
		payments = FakeCollection()

	class FakeMongoClient:
		def __init__(self, uri):
			self.uri = uri

		def __getitem__(self, name):
			return FakeDatabase()

		async def close(self):
			events.append("mongo_closed")

	class FakeEurekaClient:
		def __init__(self, **kwargs):
			pass

		async def start(self):
			raise ConnectionError("Eureka unavailable")

		async def stop(self):
			events.append("eureka_stopped")

	class FakePaymentEventPublisher:
		def __init__(self, url):
			self.url = url

		async def start(self):
			events.append("rabbitmq_started")

		async def close(self):
			events.append("rabbitmq_closed")

	monkeypatch.setattr(main, "AsyncMongoClient", FakeMongoClient)
	monkeypatch.setattr(main, "EurekaClient", FakeEurekaClient)
	monkeypatch.setattr(main, "PaymentEventPublisher", FakePaymentEventPublisher)

	async def run_lifespan():
		async with main.lifespan(FastAPI()):
			events.append("serving")

	asyncio.run(run_lifespan())

	assert events == [
		("create_index", "booking_id"),
		"rabbitmq_started",
		"serving",
		"rabbitmq_closed",
		"eureka_stopped",
		"mongo_closed",
	]
