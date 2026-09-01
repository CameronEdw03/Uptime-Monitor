# 🚨 Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, and detect outages.

This project is being built as a hands-on learning project for **FastAPI, Python, databases, background jobs, system design, SRE concepts, and AWS**.

The long-term goal is to deploy the application to AWS and use AWS services to handle monitoring, scheduling, storage, logging, and notifications.

---

## 🎯 Project Goal

Build a SaaS platform where a user can:

* Create an account
* Add websites or APIs to monitor
* Configure monitoring intervals
* Automatically check whether applications are online
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
* APScheduler

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

## Monitor API

Created the initial Monitor API.

Implemented:

```text
POST /monitors
GET  /monitors
GET  /monitors/{monitor_id}
```

The monitor model supports:

```text
Monitor
├── id
├── name
├── url
├── check_interval
└── expected_status
```

Users can configure how frequently an individual monitor should be checked.

---

## Database

* Decided to use SQLite for development
* Installed SQLModel
* Created SQLite database
* Created `Monitor` SQLModel
* Created `CheckResult` SQLModel
* Connected FastAPI to SQLite
* Created database sessions
* Successfully saved monitors to the database
* Successfully retrieved monitors from SQLite
* Successfully stored monitoring results

---

## Monitoring Foundation

* Installed HTTPX
* Created initial URL checking functionality
* Learned how to make HTTP requests to external websites
* Learned how to determine whether a website is UP/DOWN based on HTTP status codes
* Measure HTTP response time
* Handle HTTP request failures
* Store successful and failed checks in the database

A manual monitoring endpoint was also created:

```text
POST /monitors/{monitor_id}/check
```

This allows an individual monitor to be checked manually through the API.

---

# ⚙️ Automatic Monitoring

APScheduler has now been installed and integrated into the FastAPI application.

The application automatically loads monitors from SQLite when FastAPI starts and creates a scheduled job for each monitor.

Each monitor uses its own `check_interval`.

For example:

```text
Google
└── Check every 10 seconds

GitHub
└── Check every 20 seconds

My API
└── Check every 30 seconds
```

The scheduler architecture is currently:

```text
                    FastAPI
                       │
                       ▼
                  APScheduler
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
        Monitor 1  Monitor 2  Monitor 3
          10 sec     20 sec     30 sec
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

This means monitoring is no longer dependent on manually calling the `/check` endpoint.

---

# 📊 Check Results

A `CheckResult` model has been created to store the results of monitoring checks.

Current data includes:

```text
CheckResult
├── id
├── monitor_id
├── status_code
├── response_time
├── is_up
└── error_message
```

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

The application is now capable of continuously checking a URL and building a historical record of its availability.

---

# ⏭️ Next Steps

## Phase 1 — Complete Monitor CRUD

* Finish monitor update functionality
* Add `PATCH /monitors/{monitor_id}`
* Add `DELETE /monitors/{monitor_id}`
* Improve validation
* Add proper `404` handling

---

# Phase 2 — Improve Monitoring Data

The next monitoring improvement is to add timestamps to every check.

Planned field:

```text
checked_at
```

Updated model:

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

This will allow the application to determine exactly when each check occurred.

This data will eventually be used for:

* Uptime calculations
* Historical graphs
* Response-time trends
* Incident timelines
* Availability percentages

---

# Phase 3 — Incident Detection

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

* Create `Incident` model
* Detect consecutive failures
* Create incidents automatically
* Track incident start time
* Track incident resolution time
* Calculate outage duration
* Add incident API routes

---

# Phase 4 — Authentication

Add users so the application can become a real SaaS product.

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

# Phase 5 — React Dashboard

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

* React frontend
* Login page
* Dashboard
* Create monitor form
* Monitor status indicators
* Response-time charts
* Uptime percentage
* Incident history

---

# Phase 6 — Notifications

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

* Email notification
* Recovery notification
* Notification preferences
* Prevent duplicate alerts
* Add alert cooldowns

---

# ☁️ Phase 7 — AWS Deployment

Once the application works locally, begin migrating it to AWS.

The goal is to understand **why each AWS service is useful**, not just deploy the application.

### Current Local Architecture

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
```

### Planned AWS Architecture

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
Observability
       ↓
Scalability
```

The project is also providing hands-on experience with concepts related to **availability assurance and SRE**, including:

* Health checks
* Monitoring intervals
* Response-time measurement
* Failure detection
* Historical check data
* Automated background jobs
* Incident management
* Observability

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

**Current stage:** Local FastAPI + SQLite + APScheduler development

### Current capabilities

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
Retrieve Check History
```

### Next immediate task

```text
Add checked_at timestamp
       ↓
Improve monitoring history
       ↓
Build automatic incident detection
       ↓
Create Incident model
       ↓
Detect outages
       ↓
Automatically resolve incidents
```

The project is currently being developed locally before introducing the AWS architecture.

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
7. Authentication
      ↓
8. Frontend
      ↓
9. Notifications
      ↓
10. AWS Infrastructure
```

The objective is to understand **why each component exists and how the components interact**, rather than simply following a tutorial or copying a pre-built architecture.

