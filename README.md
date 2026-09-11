# Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, detect outages, and automatically manage incidents.

This project is being built as a hands-on learning project for **FastAPI, Python, React, PostgreSQL, database migrations, background jobs, system design, SRE concepts, availability assurance, observability, and AWS**.

The long-term goal is to deploy the application to AWS and use AWS services to handle infrastructure, monitoring, scheduling, storage, logging, observability, and notifications.

---

# 🎯 Project Goal

Build a SaaS platform where a user can:

* Create an account
* Log in securely
* Add websites or APIs to monitor
* Configure monitoring intervals
* Configure expected HTTP status codes
* Automatically check whether applications are online
* Measure response times
* Track historical uptime
* Detect outages
* Automatically create incidents
* Track active incidents
* Automatically resolve incidents when services recover
* View monitoring and incident data through a web dashboard
* Receive outage notifications

Eventually, users should be able to sign up and monitor their own applications through the platform.

---

# 🛠️ Current Tech Stack

## Backend

* Python
* FastAPI
* Pydantic
* SQLModel
* PostgreSQL
* Psycopg
* HTTPX
* APScheduler
* JWT Authentication
* OAuth2
* Alembic

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* Lucide React

## Database

The application currently uses **PostgreSQL** for persistent application data.

Database schema changes are managed using **Alembic migrations**.

Current database tables include:

* `user`
* `monitor`
* `checkresult`
* `incident`

### Database Migration Workflow

When the database schema needs to change:

```bash
alembic revision --autogenerate -m "describe change"
```

Review the generated migration, then apply it:

```bash
alembic upgrade head
```

Check the current migration:

```bash
alembic current
```

Check whether the models and database are synchronized:

```bash
alembic check
```

---

# 🚀 Current Features

## User Authentication

* User registration
* User login
* Password hashing
* JWT access tokens
* Protected API endpoints
* User-specific monitors
* User-specific incidents and monitoring results

## Monitor Management

Users can:

* Create monitors
* View monitors
* View individual monitors
* Update monitors
* Delete monitors
* Configure monitoring intervals
* Configure expected HTTP status codes
* Add monitor descriptions

## Automated Monitoring

Monitors are automatically checked using **APScheduler**.

Each monitor can have its own check interval.

The monitoring system records:

* HTTP status code
* Response time
* Whether the monitor is up
* Error messages
* Timestamp of the check

HTTP requests are performed using **HTTPX**.

## Incident Management

The application automatically creates an incident when a monitored service goes down.

Incidents can:

* Open when a service becomes unavailable
* Remain open while the service is still down
* Automatically resolve when the service recovers
* Record when the incident started
* Record when the incident was resolved
* Store the reason for the outage

## Monitoring Statistics

The API provides monitoring statistics including:

* Total checks
* Successful checks
* Uptime percentage
* Historical check results

---

# 🧠 SRE Concepts Practiced

This project is designed to provide hands-on experience with concepts commonly used in Site Reliability Engineering and production systems.

Current concepts include:

* Availability monitoring
* Uptime tracking
* Incident detection
* Incident lifecycle management
* Response-time measurement
* Health checks
* Automated background jobs
* Failure detection
* Automatic recovery detection
* Root-cause-oriented error information
* Authentication and authorization
* Database persistence
* Database migrations
* API design
* Observability foundations

Planned concepts include:

* Service-level objectives (SLOs)
* Service-level indicators (SLIs)
* Alerting
* Error budgets
* Distributed monitoring
* Centralized logging
* Metrics
* Tracing
* Infrastructure as code
* Containerization
* Kubernetes deployment
* AWS infrastructure

---

# 📁 Project Structure

```text
uptime-monitor/
│
├── .gitignore
│
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   ├── README
│   │   └── script.py.mako
│   │
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
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
```

> `.env` should never be committed to Git. It contains environment-specific configuration such as database credentials and secrets.

---

# 🔌 API

The backend is built using FastAPI.

The API currently supports functionality for:

* User registration
* Authentication
* Monitor creation
* Monitor retrieval
* Monitor updates
* Monitor deletion
* Automated monitoring
* Check results
* Monitoring statistics
* Incident management

Interactive API documentation is available through FastAPI:

```text
http://127.0.0.1:8000/docs
```

---

# 🗄️ Database Architecture

The application uses PostgreSQL as the primary relational database.

Current high-level relationships:

```text
User
 │
 └───< Monitor
          │
          ├───< CheckResult
          │
          └───< Incident
```

A user can own multiple monitors.

Each monitor can have:

* Many check results
* Multiple incidents over its lifetime

---

# ⏱️ Monitoring Architecture

The current monitoring flow is:

```text
Monitor
   │
   ▼
APScheduler
   │
   ▼
HTTPX Request
   │
   ▼
Target Website / API
   │
   ▼
Check Result
   │
   ├── Up ────────► Save successful check
   │
   └── Down ──────► Save failed check
                       │
                       ▼
                  Create Incident
                       │
                       ▼
                Service Recovers
                       │
                       ▼
                 Resolve Incident
```

---

# 🔐 Environment Configuration

The backend uses environment variables for sensitive configuration.

Example:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/uptime_monitor
```

The `.env` file should remain local and should be included in `.gitignore`.

---

# 🧪 Development

## Backend

Navigate to the backend:

```bash
cd backend
```

Activate the virtual environment:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

---

## Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# ☁️ AWS Roadmap

The long-term goal is to deploy the application to AWS and gradually replace local development infrastructure with production cloud services.

Planned AWS services include:

### Compute

* AWS EC2 and/or ECS
* AWS Lambda

### Database

* Amazon RDS for PostgreSQL

### Scheduling

* Amazon EventBridge

### Monitoring & Observability

* Amazon CloudWatch
* Application metrics
* Centralized logging

### Notifications

* Amazon SNS
* Amazon SES

### Storage

* Amazon S3

---

# 🐳 Infrastructure Roadmap

Future infrastructure goals include:

* Docker
* Docker Compose
* Kubernetes
* AWS deployment
* Infrastructure as Code
* Terraform
* CI/CD
* Production PostgreSQL
* Automated deployments
* Application logging
* Metrics collection
* Prometheus
* Grafana

---

# 📈 Planned Features

Future development may include:

* Monitor maintenance windows
* Email notifications
* Incident alert preferences
* SLO and SLI tracking
* Response-time graphs
* Uptime history graphs
* Incident history
* Public status pages
* API monitoring
* Custom HTTP methods
* Request headers
* Authentication for monitored APIs
* SSL certificate monitoring
* Domain expiration monitoring
* Advanced alerting
* Notification integrations
* Team accounts
* Role-based access control
* Multi-tenant architecture
* Public monitoring status pages

---

# 🎓 Learning Objectives

The primary purpose of this project is to gain practical experience building and operating a production-style application.

Key areas of learning include:

### Software Development

* Python
* FastAPI
* React
* REST APIs
* Authentication
* Database design
* Full-stack application architecture

### Databases

* PostgreSQL
* SQLModel
* SQL queries
* Relationships
* Foreign keys
* Database migrations
* Alembic

### SRE / Infrastructure

* Availability
* Monitoring
* Incident management
* Health checks
* Background jobs
* Observability
* Reliability engineering

### Cloud

* AWS
* Cloud architecture
* Managed databases
* Cloud monitoring
* Serverless services
* Infrastructure as Code
* Containerized deployments

---

# 🚧 Project Status

**Status: Active Development**

Current major milestones:

* [x] FastAPI backend
* [x] React frontend
* [x] PostgreSQL database
* [x] User authentication
* [x] JWT authentication
* [x] Monitor creation
* [x] Monitor management
* [x] Automated monitoring
* [x] Response-time tracking
* [x] Check-result storage
* [x] Automatic incident creation
* [x] Automatic incident resolution
* [x] Monitoring statistics
* [x] APScheduler background jobs
* [x] Alembic database migrations
* [x] PostgreSQL migration from SQLite
* [ ] Notification system
* [ ] SLO / SLI monitoring
* [ ] Advanced observability
* [ ] Docker deployment
* [ ] Kubernetes deployment
* [ ] AWS deployment
* [ ] Terraform infrastructure
* [ ] CI/CD pipeline

---

# 📌 Project Vision

The goal is to evolve this project from a local full-stack learning application into a production-style monitoring platform.

The final architecture is intended to demonstrate practical knowledge across:

**Software Development → Databases → APIs → SRE → Observability → Kubernetes → AWS → Infrastructure as Code**

The project is intentionally being built incrementally so that each technology is implemented and understood before moving to the next layer.

