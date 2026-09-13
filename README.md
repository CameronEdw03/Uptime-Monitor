# Uptime Monitor SaaS

A full-stack uptime and incident monitoring application that allows users to monitor websites and APIs, track uptime, measure response times, detect outages, and automatically manage incidents.

This project was built as a hands-on learning project focused on **FastAPI, Python, React, Tailwind CSS, PostgreSQL, database migrations, background jobs, Docker, Kubernetes, system design, and Site Reliability Engineering (SRE) concepts**.

---

# 🎯 Project Goal

Build a SaaS-style monitoring platform where a user can:

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

The project focuses on building a complete monitoring system from the application layer through the infrastructure layer using Docker and Kubernetes.

---

# 📸 Screenshots

Application screenshots are included in the **`screenshots/`** folder.

The folder contains screenshots showing:

* Application dashboard overview
* Creating a new monitor
* Individual monitor overview and monitoring information

---

# 🛠️ Tech Stack

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

## Infrastructure

* Docker
* Docker Compose
* Kubernetes
* Minikube
* Kubernetes Deployments
* Kubernetes Services
* Kubernetes Namespace
* Nginx
* Nginx Ingress Controller

## Database

* PostgreSQL
* SQLModel
* Alembic

---

# 🚀 Features

## User Authentication

The application includes user authentication and authorization.

Features include:

* User registration
* User login
* Password hashing
* JWT access tokens
* OAuth2 password flow
* Protected API endpoints
* User-specific monitors
* User-specific incidents
* User-specific monitoring results

Users are only able to access and manage monitoring resources belonging to their account.

---

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

Each monitor represents a website or API that the user wants to monitor.

---

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

The scheduler automatically runs checks without requiring the user to manually trigger them.

---

## Incident Management

The application automatically creates an incident when a monitored service becomes unavailable.

Incidents can:

* Open when a service becomes unavailable
* Remain open while the service is down
* Record the reason for the outage
* Record when the incident started
* Automatically resolve when the service recovers
* Record when the incident was resolved

This creates an incident lifecycle based on the actual health of the monitored service.

---

## Monitoring Statistics

The application provides monitoring statistics including:

* Total checks
* Successful checks
* Uptime percentage
* Historical check results
* Response times
* HTTP status codes

---

# 🧠 SRE Concepts Practiced

This project provided hands-on experience with concepts commonly used in Site Reliability Engineering and production systems.

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
* Authentication and authorization
* Database persistence
* Database migrations
* API design
* Observability foundations
* Containerization
* Kubernetes deployment
* Service-to-service communication
* Kubernetes networking
* Ingress

The project focuses on understanding how application reliability can be monitored and managed through automated health checks and incident tracking.

---

# 📁 Project Structure

```text
uptime-monitor/
│
├── .gitignore
├── docker-compose.yml
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
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Monitor.jsx
│   │   ├── Incidents.jsx
│   │   ├── Settings.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
│
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   └── ingress.yaml
│
└── screenshots/
    ├── creating-a-monitor.png
    ├── overview-of-monitor.png
    └── overview.png
```

> `.env` should never be committed to Git. It contains environment-specific configuration such as database credentials and secrets.

---

# 🔌 API

The backend is built using FastAPI.

The API supports functionality for:

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

Example endpoints:

```text
POST   /users
POST   /login

GET    /monitors
POST   /monitors
GET    /monitors/{monitor_id}
PATCH  /monitors/{monitor_id}
DELETE /monitors/{monitor_id}

GET    /monitors/{monitor_id}/check_results
POST   /monitors/{monitor_id}/check_results

GET    /monitors/{monitor_id}/stats

GET    /incidents
GET    /incidents/{incident_id}
```

Interactive API documentation is available through FastAPI:

```text
http://127.0.0.1:8000/docs
```

---

# 🗄️ Database Architecture

The application uses **PostgreSQL** as the primary relational database.

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

The database provides persistent storage for monitoring and incident history.

---

# 🔄 Database Migrations

Database schema changes are managed using **Alembic**.

Create a migration:

```bash
alembic revision --autogenerate -m "describe change"
```

Apply migrations:

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

# ⏱️ Monitoring Architecture

The monitoring system follows this workflow:

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
Evaluate Response
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

Each monitoring check is stored in PostgreSQL, allowing the application to maintain historical monitoring information.

---

# 🐳 Containerization

The application is containerized using Docker.

The project includes separate containers for:

* React frontend
* FastAPI backend
* PostgreSQL database

The frontend uses a multi-stage Docker build where the React application is built and then served through Nginx.

The backend runs FastAPI through Uvicorn.

Docker Compose configuration is also included for running the application's services together.

---

# ☸️ Kubernetes Deployment

The completed application was deployed locally using **Kubernetes through Minikube**.

The Kubernetes environment contains separate workloads for:

* React frontend
* FastAPI backend
* PostgreSQL database

The application resources are organized within the:

```text
uptime-monitor
```

Kubernetes namespace.

---

## Kubernetes Architecture

```text
                    Minikube
                       │
                uptime-monitor
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    Frontend        Backend       PostgreSQL
    React/Nginx      FastAPI
        │              │              │
        └────── Services ────────────┘
```

---

## Kubernetes Components

### Deployments

Separate Kubernetes Deployments are used for:

* Frontend
* Backend
* PostgreSQL

Deployments manage the application's Pods and provide the desired running state for each component.

### Services

Kubernetes Services provide stable networking between the application components.

Services are used for:

* Frontend
* Backend
* PostgreSQL

The FastAPI backend communicates with PostgreSQL through the Kubernetes Service rather than using `localhost`.

### Namespace

The application's Kubernetes resources are contained within the:

```text
uptime-monitor
```

namespace.

### Ingress

The project uses the **Nginx Ingress Controller** to route application traffic.

The intended routing structure is:

```text
uptime.local
     │
     ├── /api/* ──────► FastAPI Backend
     │
     └── /* ──────────► React Frontend
```

This allows the frontend and backend to be accessed through the same application entry point.

---

# 🧪 Development

## Backend

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
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

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
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

# ☸️ Running with Kubernetes

Start Minikube:

```bash
minikube start
```

Create the namespace:

```bash
kubectl create namespace uptime-monitor
```

Deploy the Kubernetes resources:

```bash
kubectl apply -f k8s/
```

Check Pods:

```bash
kubectl get pods -n uptime-monitor
```

Check Services:

```bash
kubectl get services -n uptime-monitor
```

Check Deployments:

```bash
kubectl get deployments -n uptime-monitor
```

Check Ingress:

```bash
kubectl get ingress -n uptime-monitor
```

---

# 📊 What This Project Demonstrates

Uptime Monitor demonstrates experience across multiple layers of modern application development:

### Application Development

* Python
* FastAPI
* React
* REST APIs
* Authentication
* Full-stack application architecture

### Database Development

* PostgreSQL
* SQLModel
* Relational data modeling
* Foreign keys
* Database relationships
* Alembic migrations

### Reliability Engineering

* Availability monitoring
* Health checks
* Uptime calculations
* Response-time monitoring
* Failure detection
* Incident management
* Automated recovery detection
* Background scheduling

### Infrastructure

* Docker
* Docker Compose
* Kubernetes
* Minikube
* Kubernetes Deployments
* Kubernetes Services
* Kubernetes DNS
* Nginx
* Nginx Ingress

---

# 🎓 Learning Objectives

The primary purpose of this project was to gain practical experience building a full-stack application and deploying it using containerized infrastructure.

Key areas of learning included:

* Building APIs with FastAPI
* Building interfaces with React and Tailwind CSS
* Designing relational database models
* Working with PostgreSQL
* Managing database migrations with Alembic
* Implementing JWT authentication
* Implementing OAuth2 authentication flows
* Creating automated background jobs
* Performing HTTP health checks
* Tracking service availability
* Designing incident lifecycles
* Containerizing applications with Docker
* Deploying applications with Kubernetes
* Working with Kubernetes Deployments and Services
* Using Kubernetes DNS for service communication
* Configuring Nginx Ingress
* Troubleshooting application and Kubernetes networking

---

# 🚧 Project Status

**Status: Completed**

The current version includes:

* FastAPI backend
* React frontend
* Tailwind CSS interface
* PostgreSQL database
* SQLModel database models
* Alembic database migrations
* User registration
* User authentication
* JWT authentication
* Protected API endpoints
* Monitor creation
* Monitor management
* Configurable monitoring intervals
* Expected HTTP status configuration
* Automated monitoring
* Response-time tracking
* Historical check results
* Uptime statistics
* Automatic incident creation
* Automatic incident resolution
* Docker containerization
* Docker Compose configuration
* Kubernetes deployment
* Kubernetes Deployments
* Kubernetes Services
* Kubernetes namespace
* PostgreSQL running in Kubernetes
* Nginx frontend container
* Nginx Ingress Controller
* Local Minikube deployment
* Application screenshots

---

# 📌 Project Vision

Uptime Monitor was built to demonstrate how a monitoring application can be developed from the application layer through the infrastructure layer.

The project combines:

**Software Development → APIs → PostgreSQL → Automated Monitoring → Incident Management → Docker → Kubernetes**

The completed project provides a practical example of building a full-stack application while applying Site Reliability Engineering principles to service monitoring, failure detection, and incident management.


