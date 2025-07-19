---
title: 📝 Centralized Logging with Loki & Grafana
date: 2025-07-10
description: How to collect logs from FastAPI and Celery using Loki
---

# 📝 Centralized Logging with Loki & Grafana

In my [previous blog](https://medium.com/@mrcompiler/handling-long-running-jobs-in-fastapi-with-celery-rabbitmq-9c3d72944410), I demonstrated how to handle long-running jobs in FastAPI using Celery and RabbitMQ. While this setup works well for asynchronous task execution, monitoring logs from multiple services — like the FastAPI API server and Celery workers — becomes a challenge as the system grows.

Without a centralized log management system, you often find yourself SSH-ing into containers or instances, tailing log files, and manually searching for errors or debugging information. This is inefficient and unsustainable for production-grade applications.

To solve this, we'll integrate Grafana Loki — a lightweight, multi-tenant log aggregation system — with Grafana, a popular visualization and monitoring tool. With this setup, we'll be able to collect, query, and visualize logs from our FastAPI application and Celery workers in a centralized dashboard.

In this post, I’ll walk you through:

- What Loki is and why it’s a good fit for FastAPI + Celery systems
- How to configure structured JSON logging in both FastAPI and Celery
- How to push logs directly from your Python applications to Loki using its HTTP API
- How to set up Loki and Grafana using Docker Compose
- How to build custom log dashboards in Grafana to monitor your API and Celery jobs

By the end of this tutorial, you'll have a lightweight, centralized log monitoring setup for your distributed FastAPI and Celery applications — no extra log shipping service required.

## 📖 What is Loki and Why Use It?

When working with multiple services like an API server, background workers, and message queues, managing logs across those services can quickly become difficult. You might need to SSH into containers, tail log files, or build complex log pipelines just to debug an issue. This is where Loki comes in.

### 🔍 What is Loki?

Grafana Loki is a horizontally scalable, highly available log aggregation system inspired by Prometheus. But unlike traditional log management systems like the ELK (Elasticsearch, Logstash, Kibana) stack, Loki takes a more lightweight approach.

Instead of indexing the entire content of logs, Loki indexes only a set of labels for each log stream (like app=fastapi or service=celery), which makes it much faster and more cost-effective for most use cases.

Loki works perfectly with Grafana for querying and visualizing logs — just like you would with time-series metrics from Prometheus.

### ✅ Why Use Loki for FastAPI + Celery?

Here’s why Loki is a great fit for our setup:

Lightweight and easy to deploy — perfect for containerized environments or small projects

Integrates naturally with Grafana for building dashboards and querying logs

Supports direct log push via HTTP API — no need for extra services like Logstash or Promtail for small setups

Multi-tenant and horizontally scalable if you ever need to scale it up

Cost-efficient since it avoids full-text indexing, focusing only on labels

For a FastAPI + Celery system, this means you can centralize logs from your API server and worker processes into a single place, query them in real-time, and visualize errors, job statuses, or debug information in Grafana — all without adding unnecessary operational overhead.

## 📖 System Architecture Explanation

The architecture for our centralized logging setup is organized into three distinct layers: Application Layer, Messaging, and Logging & Monitoring.

- The Application Layer contains two main services:

  - FastAPI App, which handles incoming API requests from clients and submits long-running or background jobs to the message broker.
  - Celery Worker, which listens to the message queue and processes those jobs asynchronously.

- The Messaging component, RabbitMQ, acts as the message broker facilitating reliable communication between FastAPI and Celery. FastAPI publishes job messages to the queue, and Celery workers consume them when ready.

- The Logging & Monitoring layer consists of two important tools:

  - Loki, a lightweight, horizontally scalable log aggregation system where both FastAPI and Celery services push their logs directly via HTTP API.

  - Grafana, a powerful visualization platform that connects to Loki, queries the logs, and presents them through customizable dashboards for easy monitoring and debugging.

This architecture ensures a clean separation of concerns between application logic, messaging, and log management while providing real-time visibility into the system’s operations.

[![](https://img.plantuml.biz/plantuml/svg/VL9DRy8m3BtdLrWzeEt07zXX0Z7jIo01GzhPBQQpI1D8qarisd-V7TgfxB2UOlkzb_USJcB2aDh6ciJ94ip8fO2MFsaBSr_Nx6huuFGcnPvX10y1T-ZG6AoI3r1Cbqymiooi0Z12bO_61AeIkbe4Y-dXOBd2nDx174yK2lWo89_pMndVOqmg8h2ii9CQ3pn0pCXIEC6h3tibwosvOxulxbbGZAX-U_rZIwtqrrYMd1Qhp0ovQ8v_k7tI4IoyOmasa3cRqFXPmSfXqE_saKTrjnlHFky1nkFRFX3SWCPSazYAig6-hP3UbM1UshBX1C--DBzTXPmZ2-2EBBzJo8WB4JKcysKRzR7g25UFcytosdJC_o2cSpu4hLfbASgO2Rcj_Y8_)](https://editor.plantuml.com/uml/VL9DRy8m3BtdLrWzeEt07zXX0Z7jIo01GzhPBQQpI1D8qarisd-V7TgfxB2UOlkzb_USJcB2aDh6ciJ94ip8fO2MFsaBSr_Nx6huuFGcnPvX10y1T-ZG6AoI3r1Cbqymiooi0Z12bO_61AeIkbe4Y-dXOBd2nDx174yK2lWo89_pMndVOqmg8h2ii9CQ3pn0pCXIEC6h3tibwosvOxulxbbGZAX-U_rZIwtqrrYMd1Qhp0ovQ8v_k7tI4IoyOmasa3cRqFXPmSfXqE_saKTrjnlHFky1nkFRFX3SWCPSazYAig6-hP3UbM1UshBX1C--DBzTXPmZ2-2EBBzJo8WB4JKcysKRzR7g25UFcytosdJC_o2cSpu4hLfbASgO2Rcj_Y8_)

## 📖 Setting Up Loki and Grafana Using Docker Compose

To keep things simple and consistent with your FastAPI + Celery + RabbitMQ setup, we'll use Docker Compose to spin up Loki and Grafana as services alongside your existing stack.

Here’s how to set up these two services:

#### 📦 Step 1: Add Loki Service

In your existing docker-compose.yml, add the following service definition for Loki:

```yaml
services:
  loki:
    image: grafana/loki:2.9.4
    container_name: loki
    ports:
      - '3100:3100'
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
```

Explanation:

- Exposes port 3100 for Loki’s HTTP API.
- Mounts a configuration file loki-config.yaml from your project directory to the container.

#### 📦 Step 2: Create Loki Configuration File([Ref](https://grafana.com/docs/loki/latest/configure/))

In your project root, create a loki-config.yaml with this minimal config:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory
  replication_factor: 1
  path_prefix: /tmp/loki

schema_config:
  configs:
    - from: 2025-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

storage_config:
  filesystem:
    directory: /tmp/loki/chunks
```

This is a minimal, dev-friendly configuration storing logs on the local filesystem.

#### 📦 Step 3: Add Grafana Service

Now, add Grafana to your docker-compose.yml:

```yaml
services:
  grafana:
    image: grafana/grafana:10.2.3
    container_name: grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - loki
```

Explanation:

- Exposes port 3000 for Grafana’s web UI.
- Sets default admin credentials (for local dev — change these in production).
- Waits for Loki to start first via depends_on.

### ✅ Summary

At this point, your Docker Compose stack will have:

- FastAPI
- Celery
- RabbitMQ
- Loki
- Grafana

All services connected, and ready to receive logs or visualize them.

## 📖 Configuring FastAPI and Celery Logging to Push Logs to Loki

We’ll use Python’s built-in logging module, along with a custom HTTP log handler to send structured JSON logs directly to Loki.

You could use third-party libraries like python-loki, but to keep it simple and transparent, we’ll write a lightweight custom handler using requests.

#### 📦 Step 1: Install Required Packages

```bash
pip install requests python-json-logger
```

- requests → to make HTTP POST requests to Loki
- python-json-logger → to structure log records as JSON

#### 📖 Step 2: Create a Custom Non-Blocking Loki Log Handler

In your project, create a file loki_handler.py:

```python
import logging
import requests
import json
from datetime import datetime, timezone
from threading import Thread

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name
        }
        return json.dumps(log_entry, default=str, ensure_ascii=False)

class LokiHandler(logging.Handler):
    def __init__(self, loki_url, labels):
        super().__init__()
        self.loki_url = loki_url
        self.labels = labels

    def emit(self, record):
        log_entry = self.format(record)
        stream = {**self.labels, "level": record.levelname.lower(),"logger": record.name}
        payload = {
            "streams": [
                {
                    "stream": stream,
                    "values": [
                        [str(int(datetime.now(timezone.utc).timestamp() * 1e9)), log_entry, ]
                    ],
                }
            ]
        }
        Thread(target=self._send_log, args=(payload,)).start()

    def _send_log(self, payload):
        try:
            requests.post(
                f"{self.loki_url}/loki/api/v1/push",
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"},
                timeout=2,
            )
        except Exception as e:
            print(f"Failed to push log to Loki: {e}")

```

Key Improvement:

- Each log push is done in a background thread.
- emit() returns immediately, avoiding latency impact.

#### 📖 Step 3: Configure Logging in FastAPI

In your FastAPI main.py:

```python
import logging
from loki_handler import LokiHandler, JsonFormatter

# Create logger
logger = logging.getLogger("fastapi_logger")
logger.setLevel(logging.INFO)

# JSON formatter
formatter = JsonFormatter()

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Loki handler (non-blocking)
loki_handler = LokiHandler(
    loki_url="http://localhost:3100",
    labels={"app": "fastapi", "env": "dev"}
)
loki_handler.setFormatter(formatter)
logger.addHandler(loki_handler)

# Example log
logger.info("FastAPI service started.")
```

#### 📖 Step 4: Configure Logging in Celery

In your Celery worker module (like worker.py):

```python
import logging
from loki_handler import LokiHandler, JsonFormatter

# Create logger
logger = logging.getLogger("celery_logger")
logger.setLevel(logging.INFO)

# JSON formatter
formatter = JsonFormatter()

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Loki handler (non-blocking)
loki_handler = LokiHandler(
    loki_url="http://localhost:3100",
    labels={"app": "celery", "env": "dev"}
)
loki_handler.setFormatter(formatter)
logger.addHandler(loki_handler)

# Example log
logger.info("Celery worker started.")
```

✅ Result:

- Logs from both FastAPI and Celery are structured JSON.
- Sent asynchronously to Loki via HTTP API.
- No delay or blocking in the main application or worker threads.
- Immediately available to query in Grafana.

## 📖 Configuring Grafana to Visualize Loki Logs

Once your Grafana container is up and running (on http://localhost:3000), let’s connect it to Loki and build a basic log dashboard.

#### 📦 Step 1: Access Grafana

Open your browser and visit:
👉 http://localhost:3000

Default credentials (as per our Docker Compose config):

- Username: admin
- Password: admin

#### 📦 Step 2: Add Loki as a Data Source

1. In Grafana’s left sidebar, click Settings → Data Sources
2. Click Add data source
3. Search for Loki and Click Loki
4. In the HTTP URL field, enter:
   `http://loki:3100`
   (this uses the Docker Compose service name loki to connect internally)

5. Click Save & Test — it should succeed if everything’s wired correctly.

#### 📦 Step 3: Create a Log Panel

Now, let’s visualize those logs.

1. In Grafana’s left menu, click Dashboards → New → New Dashboard

2. Click Add a new panel

3. In the Query editor:

- Select Loki as data source.

- Enter a query to fetch logs from your FastAPI app:

```json
{app="fastapi"}
```

- Click Run query — you should see your logs appear.

4. You can also query Celery logs:

```json
{app="celery"}
```

5. Customize your panel’s display options:

- Time range
- Log labels
- Color coding based on log levels if your JSON logs have level fields

6. Click Apply

#### 📦 Step 4: Build a Simple Dashboard

You can now create multiple panels:

- One for FastAPI logs
- One for Celery logs
- One showing only error logs:

```json
{app="fastapi"} |= "ERROR"
```

- And maybe one counting number of logs over time.

### ✅ Final Result:

Grafana now visualizes real-time logs from FastAPI and Celery via Loki.
You can filter by labels (app, env) or search by message content.
Dashboards provide centralized visibility into your entire stack’s logs.

## ✅ Pros:

Easy to set up and lightweight

No need for extra log shipper services like Promtail

Logs are available in Grafana in real-time

Non-blocking logging — logs sent in the background, no delay for API or worker processes

Structured JSON logs make filtering and searching easier

## ⚠️ Cons:

Logs might be lost if the service crashes before sending them

No retry mechanism if Loki is temporarily unavailable

Not ideal for high log volumes in production systems

Too many individual HTTP requests if log volume is very high

## 📖 Conclusion

In this post, we extended our FastAPI + Celery system by adding a centralized logging and monitoring solution using Grafana Loki. Instead of relying on scattered log files or multiple log shippers, we configured both FastAPI and Celery to push structured JSON logs directly to Loki via its HTTP API.

To keep our application performance smooth, we built a custom, non-blocking log handler that sends logs asynchronously to Loki without delaying API requests or background job execution.

With Grafana connected to Loki, we created real-time dashboards to query, filter, and visualize logs by labels — making it easy to track job executions, debug issues, and monitor errors across distributed services.

### 📌 Key Takeaways:

Loki is a lightweight, scalable, and easy-to-integrate logging system perfect for microservices and containerized environments.

Pushing logs directly via HTTP simplifies your stack for small to mid-sized projects without needing extra log shipping services.

Grafana provides powerful log visualization and filtering capabilities when combined with Loki.

Offloading log delivery to background threads avoids introducing latency into your core app and worker processes.

### 🌏 References

- [📖 Official Grafana Loki HTTP API Reference](https://grafana.com/docs/loki/latest/reference/loki-http-api/)

- [📖 Official Grafana Loki Configuration Guid](https://grafana.com/docs/loki/latest/configure/)

- And Our Best friend **ChatGPT💕**

### 📌 What’s Next?

In a future post, I’ll cover how to wrap this entire stack — FastAPI, Celery, RabbitMQ, Loki, and Grafana — into a clean Docker Compose deployment, making it easy to spin up the entire infrastructure locally or in staging environments with a single command.

Stay tuned!
