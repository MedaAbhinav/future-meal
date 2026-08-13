# FutureMeal — Quick Start

## Prerequisites
- Java 17+ (you have Java 22 ✓)
- Node.js 18+ ✓
- MySQL 8.x running locally
- Maven 3.9+ (install from https://maven.apache.org/download.cgi or use SDKMAN)

## One-time setup

### 1. Install Maven (if not installed)
Download from: https://maven.apache.org/download.cgi
Add to PATH, then verify: `mvn -version`

### 2. Database
```sql
mysql -u root -p
CREATE DATABASE futuremeal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend environment
```bash
cd backend
copy .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET
```

### 4. Frontend environment
```bash
cd frontend
copy .env.example .env
```

## Start backend
```bash
cd backend
mvn spring-boot:run
# OR with wrapper (after Maven is installed):
# ./mvnw spring-boot:run
```
Backend: http://localhost:8080
Swagger: http://localhost:8080/swagger-ui.html

## Start frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:3000

## Demo accounts
| Role             | Email                      | Password |
|-----------------|----------------------------|----------|
| Customer         | customer@futuremeal.in     | Demo@123 |
| Restaurant Owner | owner@futuremeal.in        | Demo@123 |
| Delivery Partner | delivery@futuremeal.in     | Demo@123 |
| Admin            | admin@futuremeal.in        | Demo@123 |
