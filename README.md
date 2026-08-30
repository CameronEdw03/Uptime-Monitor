# 🚨 Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, and detect outages.

This project is being built as a hands-on learning project for **FastAPI, Python, databases, system design, and AWS**.

The long-term goal is to deploy the application to AWS and use AWS services to handle monitoring, scheduling, storage, logging, and notifications.

---

## 🎯 Project Goal

Build a SaaS platform where a user can:

* Create an account
* Add websites or APIs to monitor
* Configure monitoring intervals
* Check whether applications are online
* Measure response times
* Track historical uptime
* Detect outages
* Track incidents
* Receive outage notifications
* View monitoring data through a web dashboard

Eventually, users should be able to sign up and monitor their own applications through the platform.

---

# 🛠️ Current Tech Stack

### Backend

* Python
* FastAPI
* Pydantic
* SQLModel
* SQLite
* HTTPX

### Frontend

Planned:

* React
* Tailwind CSS

### Cloud / Infrastructure

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
├── venv/
│
├── main.py
├── database.py
├── models.py
├── uptime.db
│
└── services/
    └── monitor_service.py
```

The project is intentionally being built in small pieces rather than starting with the complete AWS architecture.

---

# ✅ Completed

## FastAPI Setup

* [x] Created FastAPI application
* [x] Created `/` endpoint
* [x] Learned how FastAPI routes work
* [x] Used Swagger/OpenAPI documentation at `/docs`

## Monitor API

* [x] Created `MonitorCreate` Pydantic model
* [x] Created `POST /monitors`
* [x] Created `GET /monitors`
* [x] Started implementing `GET /monitors/{monitor_id}`

## Database

* [x] Decided to use SQLite for development
* [x] Installed SQLModel
* [x] Created SQLite database
* [x] Created `Monitor` SQLModel
* [x] Connected FastAPI to SQLite
* [x] Created database sessions
* [x] Successfully saved monitors to the database
* [x] Successfully retrieved monitors from SQLite

## Monitoring Foundation

* [x] Installed HTTPX
* [x] Created `services/monitor_service.py`
* [x] Created initial `check_url()` function
* [x] Learned how to make an HTTP request to an external website
* [x] Learned how to determine whether a website is UP/DOWN based on HTTP status codes

---

# ⏭️ Next Steps

## Phase 1 — Complete Monitor CRUD

* [ ] Finish `GET /monitors/{monitor_id}`
* [ ] Add `PATCH /monitors/{monitor_id}`
* [ ] Add `DELETE /monitors/{monitor_id}`
* [ ] Add proper `404` handling

---

## Phase 2 — Automatic Monitoring

**APScheduler has NOT been installed yet.**

Next:

* [ ] Install APScheduler

```bash
pip install apscheduler
```

* [ ] Create a background scheduler
* [ ] Run monitoring checks automatically
* [ ] Retrieve monitors from SQLite
* [ ] Check each monitor's URL
* [ ] Determine UP/DOWN status
* [ ] Measure response time

Target architecture:

```text
FastAPI
   │
   ▼
Scheduler
   │
   ▼
Get monitors from SQLite
   │
   ▼
Check URLs
   │
   ├── 🟢 UP
   │
   └── 🔴 DOWN
```

---

# Phase 3 — Store Monitoring Results

Create a `Check` database model.

Planned fields:

```text
Check
├── id
├── monitor_id
├── status_code
├── response_time
├── is_up
├── error_message
└── checked_at
```

Then:

* [ ] Save every monitoring check
* [ ] Associate checks with monitors
* [ ] Retrieve check history
* [ ] Create `GET /monitors/{monitor_id}/checks`

Example:

```text
Monitor #1

10:00  🟢 200   143ms
10:01  🟢 200   151ms
10:02  🟢 200   139ms
10:03  🔴 500   203ms
10:04  🟢 200   141ms
```

---

# Phase 4 — Incident Detection

Build logic that recognizes an outage.

Example:

```text
200
200
500
500
500
```

↓

```text
🚨 INCIDENT CREATED
```

Then when the application recovers:

```text
500
500
200
```

↓

```text
✅ INCIDENT RESOLVED
```

Tasks:

* [ ] Create `Incident` model
* [ ] Detect consecutive failures
* [ ] Create incidents automatically
* [ ] Track incident start time
* [ ] Track incident resolution time
* [ ] Calculate outage duration
* [ ] Add incident API routes

---

# Phase 5 — Authentication

Add users so the application can become a real SaaS product.

* [ ] Create User model
* [ ] Create registration endpoint
* [ ] Create login endpoint
* [ ] Implement password hashing
* [ ] Implement JWT authentication
* [ ] Create `/auth/me`
* [ ] Associate monitors with users
* [ ] Prevent users from accessing other users' monitors

Planned routes:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

# Phase 6 — React Dashboard

Build the frontend.

Planned pages:

```text
Login
   │
   ▼
Dashboard
   │
   ├── Monitors
   │
   ├── Monitor Details
   │
   └── Incidents
```

Dashboard should eventually show:

```text
My Website

🟢 Operational

Uptime
99.98%

Response Time
143ms

Incidents
2

Checks
24,381
```

Planned features:

* [ ] React frontend
* [ ] Login page
* [ ] Dashboard
* [ ] Create monitor form
* [ ] Monitor status indicators
* [ ] Response-time charts
* [ ] Uptime percentage
* [ ] Incident history

---

# Phase 7 — Notifications

Notify users when their application goes down.

Potential architecture:

```text
Monitor
   │
   ▼
Failure detected
   │
   ▼
Incident created
   │
   ▼
Notification service
   │
   ▼
📧 Email
```

Tasks:

* [ ] Email notification
* [ ] Recovery notification
* [ ] Notification preferences
* [ ] Prevent duplicate alerts
* [ ] Add alert cooldowns

---

# ☁️ Phase 8 — AWS Deployment

Once the application works locally, begin migrating it to AWS.

The goal is to understand **why each AWS service is useful**, not just deploy the application.

### Development

```text
FastAPI
   ↓
SQLite
   ↓
APScheduler
   ↓
HTTPX
```

### AWS version

```text
React
   ↓
CloudFront
   ↓
AWS infrastructure
   ↓
FastAPI
   ↓
RDS PostgreSQL
```

Monitoring:

```text
EventBridge
     │
     ▼
Lambda / Worker
     │
     ▼
Check customer application
     │
     ▼
RDS
```

Observability:

```text
Application
     │
     ▼
CloudWatch
```

Notifications:

```text
Incident
   │
   ▼
SNS / SES
   │
   ▼
Customer
```

---

# ☁️ AWS Learning Goals

This project should provide hands-on practice with:

* [ ] EC2
* [ ] EBS
* [ ] IAM
* [ ] VPC
* [ ] Security Groups
* [ ] RDS
* [ ] S3
* [ ] CloudWatch
* [ ] Lambda
* [ ] EventBridge
* [ ] SNS
* [ ] SES
* [ ] Load Balancing
* [ ] Auto Scaling
* [ ] Route 53
* [ ] CloudFront
* [ ] ECS/Fargate

Not every service needs to be part of the final production architecture. Each service should be added when there is a legitimate reason to use it.

---

# 🧠 What I'm Learning

This project is being used to understand the relationship between:

```text
Application Code
       ↓
Backend
       ↓
Database
       ↓
Background Jobs
       ↓
Networking
       ↓
Cloud Infrastructure
       ↓
Monitoring
       ↓
Scalability
```

The goal isn't just to learn how to deploy an application.

The goal is to understand **how a real production application operates in the cloud.**

---

# 🚀 Long-Term Vision

Eventually, this should become a small SaaS product where customers can:

1. Create an account
2. Add their application
3. Choose a monitoring interval
4. Receive alerts when their application goes down
5. View uptime history
6. View response-time trends
7. Review past incidents
8. Create a public status page

Potential future monetization:

```text
Free
├── 3 monitors
├── 5-minute checks
└── Basic history

Pro
├── 25 monitors
├── 1-minute checks
├── Email alerts
└── Longer history

Business
├── 100+ monitors
├── Faster checks
├── Team members
├── Advanced alerts
└── Public status pages
```

---

# 📌 Current Status

**Current stage:** Local FastAPI + SQLite development

**Next immediate task:**

```text
Install APScheduler
       ↓
Create scheduler
       ↓
Automatically check monitors
       ↓
Store check results
```

APScheduler is intentionally **not installed yet**. That will be the starting point for the next development session.
