---
title: ⚙️ Autoscaling Celery Workers with KEDA on Kubernetes
date: 2025-11-23
description: Automatically scale Celery workers based on RabbitMQ queue length using KEDA.
---

---

# ⚙️ Autoscaling Celery Workers with KEDA on Kubernetes

In my [previous blog](#/post/loki-monitoring), we explored how to centralize logs from FastAPI and Celery using Loki and Grafana. That setup gave us visibility across our system — but as our workload grows, the next challenge emerges:

> **How do we scale Celery workers automatically based on the number of pending jobs?**

In this post, we’ll integrate **KEDA (Kubernetes Event-Driven Autoscaler)** into our Celery setup, enabling event-driven autoscaling based on RabbitMQ queue depth.

---

## 🤔 The Problem

When Celery workers are deployed with a **fixed number of replicas**, two things usually happen:

- Workers sit idle when there are no jobs.
- Workers get overwhelmed when the job queue spikes.

The standard **Horizontal Pod Autoscaler (HPA)** isn’t queue-aware — it only looks at CPU or memory usage, which doesn’t always reflect workload.

**KEDA** solves this by letting us scale based on _actual events_, such as the number of queued messages.

---

## ⚡ What is KEDA?

**KEDA** is a lightweight CNCF project (backed by Microsoft and Red Hat) that extends Kubernetes autoscaling to external event sources like:

- RabbitMQ, Kafka, or Redis Streams
- HTTP requests
- Azure Service Bus, AWS SQS, etc.

For Celery, KEDA monitors the RabbitMQ queue and automatically adjusts the **number of worker pods** based on how many jobs are waiting.

---

## 🧩 Architecture Overview

After adding KEDA, our setup looks like this:

```
FastAPI  →  RabbitMQ Queue  →  Celery Workers (scaled by KEDA)
```

1. FastAPI enqueues jobs in RabbitMQ.
2. KEDA monitors the queue length.
3. When there are pending jobs, KEDA increases Celery replicas.
4. When the queue is empty, KEDA scales workers back to zero.

This gives us **on-demand scaling** and **zero idle cost**.

---

## 🐇 Step 1: Deploy RabbitMQ via Helm (Ignore if already deployed)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install rabbitmq bitnami/rabbitmq
```

Verify the deployment:

```bash
kubectl get pods -l app.kubernetes.io/name=rabbitmq
kubectl get svc -l app.kubernetes.io/name=rabbitmq
```

You’ll usually get a service like `rabbitmq.default.svc.cluster.local`.

---

## ⚙️ Step 2: Create the Celery Worker Deployment

Create a file named `celery-worker.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
  labels:
    app: celery-worker
spec:
  replicas: 1
  selector:
    matchLabels:
      app: celery-worker
  template:
    metadata:
      labels:
        app: celery-worker
    spec:
      containers:
        - name: celery
          image: your-dockerhub-username/celery-app:latest
          command: ["celery"]
          args:
            [
              "-A",
              "app.celery_app",
              "worker",
              "--loglevel=INFO",
              "--concurrency=1",
            ]
          env:
            - name: CELERY_BROKER_URL
              value: "amqp://user:password@rabbitmq.default.svc.cluster.local:5672//"
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2"
              memory: "2Gi"
```

### Notes

- `--concurrency=1` → 1 job per pod.
- Define CPU/memory limits to avoid over-allocation.
- Adjust broker URL according to your namespace.

---

## ⚡ Step 3: Install KEDA

Install KEDA in your cluster:

```bash
kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.18.0/keda-2.18.0.yaml
```

Verify the installation:

```bash
kubectl get pods -n keda
```

You should see `keda-operator` and `keda-metrics-apiserver` pods running.

---

## 📊 Step 4: Create a ScaledObject for Celery

Create a file `celery-scaledobject.yaml`:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: celery-worker-scaler
spec:
  scaleTargetRef:
    name: celery-worker
  pollingInterval: 5 # check queue every 5s
  cooldownPeriod: 60 # wait before scaling down
  minReplicaCount: 0
  maxReplicaCount: 10
  triggers:
    - type: rabbitmq
      metadata:
        protocol: amqp
        queueName: celery
        mode: QueueLength
        value: "1" # 1 message = 1 worker
        hostFromEnv: CELERY_BROKER_URL
```

### Explanation

- KEDA monitors the `celery` queue.
- Scales 1 worker per message.
- Automatically manages scale-up and scale-down.

---

## 🌍 Step 5: Apply the Configuration

```bash
kubectl apply -f celery-worker.yaml
kubectl apply -f celery-scaledobject.yaml
```

Then observe scaling in real-time:

```bash
kubectl get deploy celery-worker -w
```

Submit a few tasks and watch new worker pods spin up.

---

## 🔁 How It Works

1. FastAPI enqueues jobs in RabbitMQ.
2. KEDA polls queue metrics every few seconds.
3. If jobs are pending → more pods.
4. Once jobs complete → fewer pods.

All of this happens automatically via Kubernetes CRDs.

---

## 🔐 Best Practices

**Celery configuration:**

```python
task_acks_late = True
task_reject_on_worker_lost = True
worker_prefetch_multiplier = 1
```

Ensures task safety if pods terminate mid-job.

**Graceful shutdown:**

```yaml
terminationGracePeriodSeconds: 60
```

Gives Celery time to finish tasks before pod deletion.

**Polling tuning:**

- Use 3–5s for faster reaction.
- Increase cooldown for stability (avoid scale flapping).

---

## 📈 Benefits

- Event-driven scaling tied to queue depth.
- Zero idle compute cost (scale-to-zero).
- Handles job spikes smoothly.
- Simple YAML-based setup, no code changes.

---

## 🏁 Conclusion

By integrating **KEDA** with your Celery deployment, you make your background processing layer fully **event-driven and elastic**. It scales precisely when your queue grows and shrinks back when idle — keeping your Kubernetes cluster efficient and cost-friendly.

In the **next part of this series**, we’ll explore how to scale ML workloads efficiently using **Dask Gateway** alongside Celery.

---

## 📚 References

- [KEDA Documentation](https://keda.sh/docs/latest/) : Learn about all KEDA scalers, architecture, and deployment options.

- [RabbitMQ Scaler Guide](https://keda.sh/docs/latest/scalers/rabbitmq-queue/) : Detailed explanation of RabbitMQ-based triggers, including configuration options.

- [Celery Official Documentation](https://docs.celeryq.dev/en/stable/) : For task acknowledgment, concurrency, and worker lifecycle settings.

- [KEDA Helm Charts Repository](https://github.com/kedacore/charts) : The official Helm repository for installing KEDA in Kubernetes.

---

**Thanks for reading!**  
Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/the-mr-compiler/) or reach out via email at [meghanathms06@gmail.com](mailto:meghanathms06@gmail.com). 🚀
