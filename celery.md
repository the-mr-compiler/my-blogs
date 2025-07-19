---
title: 🚀 Handling Long-Running Jobs in FastAPI with Celery & RabbitMQ
date: 2025-07-05
description: Learn how to manage long-running tasks in FastAPI using Celery and RabbitMQ
---

# 🚀 Handling Long-Running Jobs in FastAPI with Celery & RabbitMQ

## 📖 Introduction

Modern web applications often need to perform operations that take a long time—such as machine learning model training, data processing, or running system commands. If these tasks block your FastAPI server, it can slow down or even halt your API for other users.

**Solution:** Offload long-running jobs to background workers using [Celery](https://docs.celeryq.dev/en/stable/) and [RabbitMQ](https://www.rabbitmq.com/) as a message broker. This blog shows how to set up FastAPI with Celery and RabbitMQ to handle multiple types of background tasks efficiently.

---

## 📚 Tech Stack

- **FastAPI**: High-performance Python web framework.
- **Celery**: Distributed task queue for asynchronous job execution.
- **RabbitMQ**: Message broker for managing task queues.
- **(Optional) Redis/DB**: For storing task results.
- **Docker**: For containerized deployment.

---

## 🎯 Use Case

We'll build an API that supports:

- **ML model training tasks**
- **System command executions**
- **Data transformation operations**

Each runs asynchronously via Celery workers.

---

## 📊 System Architecture

Below is a high-level diagram showing the interaction between the components:
![text](https://uml.planttext.com/plantuml/png/VPHFRzGm4CNl_XIZS5aExLOWSU20siss24G5R8iu8YUPtLgRs65i2r2rtvrndAJvqqPxoSxxsVDcNfHBwoGvNvN27fMk9SaA27CdzQ54U1G06vaV3sIyBb9J6e9N-sB_3jy6nL215AjPoHZNTX4aZGHlBhXmzo0ByqVf0pZoA4w3FeLqCfFsfJONuVTicvCGCdVyDqbBXTh1weT5Mbzz-mIfqTPNIAyJa1QYBCJJHCcDj2w0LtLTgbmwPNJI61WmGR_MHMsKTZQg0DvY7imcQqTIwMHInB-OUuVJChFQxWrLKu7txhnTFpffZxzKSPhgXDQNRgoVmkG3dpkPPShTVeVLXion6pe-Zy0KIwH_yDCGAtOsx-qN-6ooLax6McggIkhYUN7B2S9zDsApp1vagtt0oTSwQBA4NJDMapRohIiyFvnpiL1slTr4_n7PReHeqpqx-z1l7Tx3NNXZWJtVysh6J1S2KzVn4Lh_ixlQLFhxuYYp6sSnyO6FwC8Xhe_PMMGj6mSIefyXu36bO5J_zkWnzXwCi0GD_B-CYRRSc1j7p6XRQCWXECcRoQuoGnVIvsDF2nNJxk5qbt8JW27ijZGpi0WlMLWwA2xvxGjVlVy0)

---

## 📦 Project Structure

```
/project-root
  ├── celery_app.py
  ├── tasks.py
  ├── main.py
  ├── Dockerfile
  └── docker-compose.yml
```

---

## ⚙️ Step-by-Step Setup: FastAPI + Celery + RabbitMQ

### 1. Install Dependencies

```bash
pip install fastapi celery
```

### 2. Set Up RabbitMQ with Docker Compose

```yaml
services:
  rabbitmq:
    image: rabbitmq:management
    ports:
      - '5672:5672'
      - '15672:15672'
```

> 💡 **Tip:** Access the RabbitMQ management UI at [http://localhost:15672](http://localhost:15672) (default user/pass: guest/guest).

### 3. Create the Celery App (`celery_app.py`)

```python
from celery import Celery

celery = Celery(
    'worker',
    broker='amqp://guest:guest@localhost:5672//',
    backend='rpc://'
)
```

### 4. Define Tasks (`tasks.py`)

```python
from celery_app import celery
import time

@celery.task
def train_ml_model(data):
    time.sleep(10)
    return {"status": "ML model trained"}

@celery.task
def run_command(command):
    import subprocess
    result = subprocess.run(command, shell=True, capture_output=True)
    return result.stdout.decode()

@celery.task
def transform_data(data):
    transformed = [d['value'] * 2 for d in data]
    return transformed
```

### 5. Build the FastAPI App (`main.py`)

```python
from fastapi import FastAPI
from tasks import train_ml_model, run_command, transform_data
from celery_app import celery

app = FastAPI()

@app.post("/train")
def start_ml_training():
    task = train_ml_model.delay({"sample": "data"})
    return {"task_id": task.id}

@app.post("/execute")
def execute_command(command: str):
    task = run_command.delay(command)
    return {"task_id": task.id}

@app.post("/transform")
def start_data_transformation():
    sample_data = [{"value": 10}, {"value": 20}, {"value": 30}]
    task = transform_data.delay(sample_data)
    return {"task_id": task.id}

@app.get("/status/{task_id}")
def get_task_status(task_id: str):
    task = celery.AsyncResult(task_id)
    return {"status": task.status}

@app.get("/result/{task_id}")
def get_task_result(task_id: str):
    task = celery.AsyncResult(task_id)
    return {"result": task.result if task.ready() else None}
```

---

## 🚦 Checking Task Status & Results

- **Check Status:**  
  `GET /status/{task_id}` returns the current state (`PENDING`, `STARTED`, `SUCCESS`, etc.).
- **Get Result:**  
  `GET /result/{task_id}` returns the result if the task is finished, or `null` otherwise.

---

## 🐳 Running Everything Together

```bash
docker-compose up -d
celery -A celery_app.celery worker --loglevel=info
uvicorn main:app --reload
```

> ⚠️ **Note:**
>
> - Make sure RabbitMQ is running before starting Celery and FastAPI.
> - If you use Docker for all services, update the broker URL to use the RabbitMQ service name (e.g., `broker='amqp://guest:guest@rabbitmq:5672//'`).

---

## ✅ Conclusion

We built a clean, scalable architecture to handle long-running jobs using FastAPI, Celery, and RabbitMQ.  
This design is easily extensible: add more task types, plug in Redis/DB for result persistence, or scale your workers for production.

---

## 📌 Future Improvements

- Add **Kubernetes support** with HPA & KEDA.
- Integrate **Prometheus & Grafana** for monitoring.
- Use **PostgreSQL** as a result backend.
- Deploy as microservices.

---

## 🛠️ Troubleshooting

- **Task stuck in PENDING?**  
  Check that Celery workers are running and connected to the correct broker.
- **Cannot connect to RabbitMQ?**  
  Ensure RabbitMQ is running and the broker URL is correct.

---

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Celery Documentation](https://docs.celeryq.dev/en/stable/)
- [Asynchronous Tasks with FastAPI and Celery](https://testdriven.io/blog/fastapi-and-celery)

---

**Thanks for reading!**  
Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/the-mr-compiler/) or reach out via email at [meghanathms06@gmail.com](mailto:meghanathms06@gmail.com). 🚀
