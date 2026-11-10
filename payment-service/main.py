from fastapi import FastAPI

app = FastAPI(title="Payment Service (Python + FastAPI)")

@app.get("/api/payments/health")
def health():
    return {"status": "UP", "service": "Payment Service (Python + FastAPI)"}
