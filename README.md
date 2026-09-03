# Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, detect outages, and automatically manage incidents.

This project is being built as a hands-on learning project for **FastAPI, Python, databases, background jobs, system design, SRE concepts, availability assurance, observability, and AWS**.

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

Planned:

* React
* Tailwind CSS

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
├── .venv/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── database.db
│
└── services/
    └── monitor_service.py
```

The project is intentionally being built in small pieces rather than starting with the complete AWS architecture.

---

# ✅ Completed

## FastAPI Setup

* Created FastAPI application
* Created API routes
* Learned how FastAPI routes work
* Used Swagger/OpenAPI documentation at `/docs`
* Added dependency injection for database sessions
* Added HTTP exception handling

---

# 🖥️ Monitor API

The Monitor API allows monitors to be created, viewed, updated, and deleted.

## Current Routes

```text
POST   /monitors
GET    /monitors
GET    /monitors/{monitor_id}
PATCH  /monitors/{monitor_id}
DELETE /monitors/{monitor_id}
```

## Monitor Model

```text
Monitor
├── id
├── name
├── url
├── check_interval
└── expected_status
```

Each monitor can have its own:

* Name
* URL
* Check interval
* Expected HTTP status code

For example:

```text
Name:       My API
URL:        https://example.com
Interval:   10 seconds
Expected:   200
```

---

# ✏️ Monitor Updates

A monitor can now be updated without deleting and recreating it.

The update endpoint is:

```text
PATCH /monitors/{monitor_id}
```

Monitor properties that can be updated include:

```text
name
url
check_interval
expected_status
```

This allows monitoring configuration to change while the application is running.

---

# 🗑️ Monitor Deletion

Monitors can also be deleted through:

```text
DELETE /monitors/{monitor_id}
```

The API verifies that the monitor exists before deleting it.

---

# 🗄️ Database

SQLite is currently being used for local development.

Implemented:

* Installed SQLModel
* Created SQLite database
* Created `Monitor` SQLModel
* Created `CheckResult` SQLModel
* Created `Incident` SQLModel
* Connected FastAPI to SQLite
* Created database sessions
* Successfully saved monitors
* Successfully retrieved monitors
* Successfully stored monitoring results
* Successfully stored incidents
* Added timestamps to monitoring records

The current database contains three primary tables:

```text
Monitor
CheckResult
Incident
```

---

# 🌐 Monitoring Foundation

HTTPX is used to make HTTP requests to monitored applications.

The monitoring system can:

* Send HTTP requests
* Determine whether an application is UP or DOWN
* Compare the returned HTTP status against the expected status
* Measure response time
* Detect HTTP failures
* Detect request failures
* Store successful checks
* Store failed checks
* Record error messages

Response time is measured in milliseconds.

Example:

```text
youtube: UP 200 227.44 ms
```

This means:

```text
Monitor:       youtube
Status:        UP
HTTP Status:   200
Response Time: 227.44 ms
```

---

# ⏱️ Automatic Monitoring

APScheduler has been integrated into the FastAPI application.

When the application starts, it:

1. Connects to SQLite
2. Loads existing monitors
3. Creates a scheduled job for each monitor
4. Uses the monitor's configured `check_interval`
5. Automatically checks the URL
6. Saves the result to the database

Each monitor can use a different monitoring interval.

Example:

```text
Google
└── Check every 10 seconds

GitHub
└── Check every 20 seconds

My API
└── Check every 30 seconds
```

The monitoring interval is configured per monitor.

---

# 🔄 Monitoring Architecture

```text
                    FastAPI
                       │
                       ▼
                 APScheduler
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
         Monitor 1  Monitor 2  Monitor 3
          10 sec      20 sec      30 sec
             │          │          │
             ▼          ▼          ▼
         Check URL  Check URL  Check URL
             │          │          │
             └──────────┼──────────┘
                        ▼
                   CheckResult
                        │
                        ▼
                     SQLite
```

Monitoring is now automatic rather than dependent on manually calling an endpoint.

---

# 📊 Check Results

A `CheckResult` record is created for every monitoring attempt.

## CheckResult Model

```text
CheckResult
├── id
├── monitor_id
├── status_code
├── response_time
├── is_up
├── error_message
└── checked_at
```

The `checked_at` field records when the monitoring check occurred.

Example:

```text
2026-09-03 04:09:39
```

Response times are stored in milliseconds.

Example:

```text
200
227.44 ms
UP
```

---

# 📚 Monitoring History

Monitoring results can be retrieved using:

```text
GET /monitors/{monitor_id}/check_results
```

All check results can also be retrieved using:

```text
GET /check_results
```

Example monitoring history:

```text
Monitor #1

🟢 200   143ms
🟢 200   151ms
🟢 200   139ms
🔴 500   203ms
🟢 200   141ms
```

This creates a historical record that can eventually be used for uptime calculations, charts, and availability reporting.

---

# 🚨 Incident Detection

The application now automatically detects monitoring failures and creates incidents.

When a monitor returns an unexpected status, the system checks whether an open incident already exists.

If there is no existing open incident, a new incident is created.

Example:

```text
Expected: 200

Actual:
500
```

The system creates:

```text
🚨 INCIDENT CREATED
```

The incident stores:

```text
Incident
├── id
├── monitor_id
├── started_at
├── resolved_at
├── status
└── reason
```

Example reason:

```text
Expected status 200, got 500
```

---

# 🔁 Incident Prevention of Duplicates

The monitoring system checks for an existing open incident before creating a new one.

This prevents every failed monitoring request from creating another incident.

For example:

```text
500
500
500
500
```

Results in:

```text
1 Open Incident
```

rather than:

```text
4 Separate Incidents
```

---

# ✅ Automatic Incident Resolution

When a monitor recovers and returns its expected status, the application checks for an open incident.

If an open incident exists, it is automatically resolved.

Example:

```text
500
500
500
200
```

Results in:

```text
🚨 INCIDENT CREATED

...

✅ INCIDENT RESOLVED
```

The incident records both:

```text
started_at
resolved_at
```

This provides the foundation for calculating outage duration.

---

# 🖥️ Terminal Monitoring Output

The monitoring system prints useful information directly to the terminal.

Example:

```text
youtube: UP 200 227.44 ms
Check completed for monitor: youtube
```

When an outage occurs:

```text
INCIDENT CREATED: youtube
youtube: DOWN 500 210.52 ms
```

When the application recovers:

```text
Incident resolved: youtube
youtube: UP 200 190.21 ms
```

This provides basic operational visibility while the application is running locally.

---

# 🔌 Request Failure Handling

The application also handles situations where an HTTP request cannot successfully reach the monitored application.

Examples include:

* Connection failures
* Timeouts
* DNS problems
* Other HTTPX request errors

Failed requests are stored as `CheckResult` records with:

```text
status_code = None
is_up = False
error_message = <error>
```

This allows the monitoring history to distinguish between HTTP failures and request-level failures.

---

# 📖 API Documentation

FastAPI automatically provides interactive API documentation.

Once the backend is running:

```text
http://127.0.0.1:8000/docs
```

Swagger can be used to:

* Create monitors
* View monitors
* Update monitors
* Delete monitors
* View check results
* Test API routes

---

# 🔐 Phase 4 — Authentication

Authentication is still planned.

The goal is to add users so the application can become a real SaaS product.

Planned functionality:

* Create User model
* Create registration endpoint
* Create login endpoint
* Implement password hashing
* Implement JWT authentication
* Create `/auth/me`
* Associate monitors with users
* Prevent users from accessing other users' monitors

Planned routes:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

# ⚛️ Phase 5 — React Dashboard

The frontend will eventually provide a web dashboard for managing monitors and viewing monitoring data.

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

The dashboard should eventually display:

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

* React frontend
* Login page
* Dashboard
* Create monitor form
* Edit monitor form
* Delete monitor functionality
* Monitor status indicators
* Response-time charts
* Uptime percentage
* Check history
* Incident history
* Incident status

---

# 📧 Phase 6 — Notifications

The next stage will be notifying users when their application goes down.

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

Planned functionality:

* Email notification
* Recovery notification
* Notification preferences
* Prevent duplicate alerts
* Alert cooldowns

---

# ☁️ Phase 7 — AWS Deployment

Once the local application is stable, the project will begin migrating toward AWS.

The goal is to understand **why each AWS service is useful**, not simply deploy the application.

## Current Local Architecture

```text
FastAPI
   ↓
SQLite
   ↓
APScheduler
   ↓
HTTPX
   ↓
CheckResult
   ↓
Incident
```

## Planned AWS Architecture

```text
React
   ↓
CloudFront
   ↓
AWS Infrastructure
   ↓
FastAPI
   ↓
RDS PostgreSQL
```

---

# 🔄 Planned AWS Monitoring Architecture

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

The goal is eventually to move monitoring workloads away from the local APScheduler implementation and into scalable cloud infrastructure.

---

# 👀 Planned Observability

```text
Application
     │
     ▼
CloudWatch
```

AWS CloudWatch will eventually be used for application logs, metrics, and operational visibility.

---

# 📬 Planned Notification Architecture

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

This project will provide hands-on practice with:

* EC2
* EBS
* IAM
* VPC
* Security Groups
* RDS
* S3
* CloudWatch
* Lambda
* EventBridge
* SNS
* SES
* Load Balancing
* Auto Scaling
* Route 53
* CloudFront
* ECS/Fargate

Not every service needs to be part of the final production architecture.

Each AWS service should be introduced when there is a legitimate architectural reason to use it.

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
HTTP Monitoring
       ↓
Incident Management
       ↓
Networking
       ↓
Cloud Infrastructure
       ↓
Monitoring
       ↓
Observability
       ↓
Scalability
```

The project is also providing hands-on experience with concepts related to **availability assurance and SRE**, including:

* Health checks
* Monitoring intervals
* HTTP status monitoring
* Response-time measurement
* Failure detection
* Historical check data
* Automated background jobs
* Incident management
* Incident resolution
* Observability
* Availability monitoring

The goal isn't just to learn how to deploy an application.

The goal is to understand **how a real production application operates and how engineers detect and respond to failures.**

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

**Current stage:** Local FastAPI + SQLite + APScheduler development

## Current Capabilities

```text
Create Monitor
      ↓
Store Monitor in SQLite
      ↓
Configure Check Interval
      ↓
APScheduler
      ↓
Automatically Check URL
      ↓
Determine UP/DOWN
      ↓
Measure Response Time
      ↓
Store CheckResult
      ↓
Record Check Timestamp
      ↓
Detect Failure
      ↓
Create Incident
      ↓
Continue Monitoring
      ↓
Detect Recovery
      ↓
Resolve Incident
      ↓
Retrieve Check History
```

The application can currently monitor a configured URL automatically, store monitoring results, detect outages, create incidents, and resolve incidents when the monitored service recovers.

---

# 🎯 Next Immediate Tasks

```text
Improve Monitor Validation
       ↓
Improve Incident Logic
       ↓
Add Incident API Routes
       ↓
Build Monitoring History API
       ↓
Build React Dashboard
       ↓
Add Authentication
       ↓
Add Notifications
       ↓
Containerize Application
       ↓
Deploy to AWS
```

---

# 📈 Development Philosophy

This project is intentionally being built incrementally.

Instead of immediately deploying a large cloud architecture, each layer is being implemented and understood first:

```text
1. FastAPI
      ↓
2. Database
      ↓
3. HTTP Monitoring
      ↓
4. Automated Scheduling
      ↓
5. Check Results
      ↓
6. Incident Detection
      ↓
7. Incident Resolution
      ↓
8. Monitor CRUD
      ↓
9. Authentication
      ↓
10. Frontend
      ↓
11. Notifications
      ↓
12. AWS Infrastructure
```

The objective is to understand **why each component exists and how the components interact**, rather than simply following a tutorial or copying a pre-built architecture.

The project is being developed locally first so that the underlying monitoring, database, scheduling, and incident-management concepts are understood before introducing cloud infrastructure.

