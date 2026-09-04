

# Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, detect outages, and automatically manage incidents.

This project is being built as a hands-on learning project for **FastAPI, Python, React, databases, background jobs, system design, SRE concepts, availability assurance, observability, and AWS**.

The long-term goal is to deploy the application to AWS and use AWS services to handle monitoring, scheduling, storage, logging, observability, and notifications.

---

# 🎯 Project Goal

Build a SaaS platform where a user can:

* Create an account
* Add websites or APIs to monitor
* Configure monitoring intervals
* Automatically check whether applications are online
* Measure response times
* Track historical uptime
* Detect outages
* Automatically create incidents
* Automatically resolve incidents when services recover
* Receive outage notifications
* View monitoring data through a web dashboard

Eventually, users should be able to sign up and monitor their own applications through the platform.

---

# 🛠️ Current Tech Stack

## Backend

* Python
* FastAPI
* Pydantic
* SQLModel
* SQLite
* HTTPX
* APScheduler

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* Lucide React

## Cloud / Infrastructure

Planned:

* AWS EC2 / ECS
* AWS RDS
* AWS EventBridge
* AWS Lambda
* AWS CloudWatch
* AWS SNS / SES
* AWS S3

---

# 📁 Current Project Structure

```text
uptime-monitor/
│
├── .gitignore
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── database.db
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── Monitor.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
