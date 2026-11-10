from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "smartride_payment"
    eureka_enabled: bool = True
    eureka_server: str = "http://localhost:8761/eureka"
    eureka_app_name: str = "payment-service"
    eureka_instance_host: str = "localhost"
    eureka_instance_port: int = 8004
    rabbitmq_url: str = "amqp://smartride:smartride@localhost:5672/"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()