# 🍛 FutureMeal — Plan. Discover. Eat.

> An AI-native Indian food delivery platform with intelligent meal planning.

## Problem

Hunger is unpredictable. You decide what to eat only when you're already hungry — and by then, your decision is rushed, irrational, and often disappointing.

## Solution

**FutureMeal** lets you plan your meals in advance. Tell the system what you want to eat, when, and your budget constraints. The engine watches restaurants, prices, and availability — and presents you with the perfect recommendation exactly when your mealtime arrives.

---

## Core Feature: FutureMeal

```
"I want biryani after my exam on Friday around 7:30 PM, under ₹250."

→ FutureMeal Created ✓
→ Engine watching...
→ Match Found: Chicken Dum Biryani • Spice Route • ₹229 • 28 min • 4.6★
→ Order now?
```

The recommendation engine scores candidates across 6 weighted factors:
budget · availability · distance · delivery time · rating · preference match

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS          |
| Backend   | Java 17, Spring Boot 3.2, Spring Security         |
| Auth      | JWT (access + refresh tokens), BCrypt             |
| Database  | MySQL 8.x with JPA/Hibernate                      |
| API Docs  | SpringDoc OpenAPI (Swagger UI)                    |
| Tests     | JUnit 5, Spring Boot Test, MockMvc                |

---

## Project Structure

```
futuremeal/
├── frontend/          React + Vite + TypeScript + Tailwind
├── backend/           Spring Boot 3.2 + Java 17
├── database/          schema.sql + seed.sql
├── docs/              ARCHITECTURE.md · API.md · FUTUREMEAL.md
└── README.md
```

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.x running locally

### 1. Database Setup

```bash
mysql -u root -p
CREATE DATABASE futuremeal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 2. Backend Setup

```bash
cd futuremeal/backend

# Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET at minimum

# Run (JPA creates tables automatically)
./mvnw spring-boot:run
```

Backend starts on **http://localhost:8080**
Swagger UI: **http://localhost:8080/swagger-ui.html**

### 3. Frontend Setup

```bash
cd futuremeal/frontend

# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Required | Description                          |
|-----------------------|----------|--------------------------------------|
| `DB_URL`              | Yes      | MySQL JDBC connection URL            |
| `DB_USERNAME`         | Yes      | MySQL username                       |
| `DB_PASSWORD`         | Yes      | MySQL password                       |
| `JWT_SECRET`          | Yes      | ≥256-bit secret for JWT signing      |
| `JWT_EXPIRATION`      | No       | Token TTL ms (default: 86400000)     |
| `ALLOWED_ORIGINS`     | No       | CORS origins (default: localhost)    |
| `AI_ENABLED`          | No       | Enable AI recommendations (false)    |
| `AI_API_KEY`          | No       | OpenAI / Gemini API key              |
| `PAYMENT_GATEWAY`     | No       | razorpay/paytm/none (default: none)  |
| `SEED_DATA_ENABLED`   | No       | Load demo data on startup (true)     |

### Frontend (`frontend/.env`)

| Variable         | Description                        |
|------------------|------------------------------------|
| `VITE_API_URL`   | Backend URL (default: localhost:8080) |

---

## Demo Accounts

| Role             | Email                       | Password   |
|------------------|-----------------------------|------------|
| Customer         | customer@futuremeal.in      | Demo@123   |
| Restaurant Owner | owner@futuremeal.in         | Demo@123   |
| Delivery Partner | delivery@futuremeal.in      | Demo@123   |
| Admin            | admin@futuremeal.in         | Demo@123   |

> ⚠️ Do NOT use these credentials in production. Change all passwords before deploying.

---

## API Documentation

Full REST API documentation is available at **http://localhost:8080/swagger-ui.html** when the backend is running.

### Key Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Current user profile

GET    /api/restaurants            List restaurants (filters: city, cuisine, sortBy)
GET    /api/restaurants/{id}       Restaurant details
GET    /api/restaurants/{id}/foods Restaurant menu

GET    /api/foods/popular          Bestseller foods
GET    /api/foods/search?query=    Search foods

POST   /api/cart/items             Add to cart
GET    /api/cart                   View cart
POST   /api/orders                 Place order
GET    /api/orders                 My orders
GET    /api/orders/{id}            Order details + tracking

POST   /api/future-meals           Create FutureMeal plan
GET    /api/future-meals           My FutureMeals
POST   /api/future-meals/{id}/evaluate  Trigger evaluation
POST   /api/future-meals/{id}/order    Order from recommendation

GET    /api/admin/stats            Platform statistics (admin only)
```

---

## Features

### Customer
- Browse and search restaurants
- Filter by cuisine, dietary type, rating
- Add to cart (multi-item, multi-quantity)
- Checkout with UPI / Card / COD
- Real-time order tracking with status timeline
- FutureMeal planning dashboard
- Delivery address management
- Order history and reordering

### Restaurant Owner
- Register and manage restaurant
- Add/edit/delete food items
- Toggle food availability
- View and update order statuses
- Analytics dashboard (today's orders, revenue, rating)

### Delivery Partner
- View available deliveries
- Accept and update delivery status

### Admin
- Platform-wide statistics
- User and restaurant management
- Approve/suspend restaurants
- FutureMeal monitoring

---

## FutureMeal — How It Works

1. **Plan** — User describes their future meal with date, time, budget, cuisine, dietary, and spice preferences
2. **Watch** — The engine evaluates restaurants every 5 minutes using a 6-factor scoring algorithm
3. **Match** — When a good match is found, status becomes `MATCH_FOUND`
4. **Ready** — 30 minutes before planned time, status becomes `READY` with a full recommendation
5. **Order** — One tap to place the order from the recommendation

Read more: [docs/FUTUREMEAL.md](docs/FUTUREMEAL.md)

---

## Known Limitations

1. **GPS-based distance** — Currently uses rating as a distance proxy. Integrate Google Maps API for real distance scoring.
2. **AI recommendations** — Architecture is ready; requires `AI_API_KEY` configuration to activate.
3. **Payment gateway** — Payment abstraction is implemented. Configure `PAYMENT_GATEWAY=razorpay` and keys to enable live payments.
4. **Push notifications** — Notification entity exists; wire up Firebase/APNs for real-time delivery.
5. **Image uploads** — Food/restaurant images use external URLs. Integrate S3 or Cloudinary for file uploads.
6. **Real-time order tracking** — Currently polling; upgrade to WebSocket with STOMP for live tracking.

---

## Recommended Next Steps

1. Integrate Razorpay SDK (frontend) + `/api/payment/initiate` endpoint
2. Implement `OpenAIRecommendationService` using the `AIService` interface
3. Add GPS distance scoring using Google Maps Distance Matrix API
4. Add WebSocket order tracking with `spring-boot-starter-websocket`
5. Implement Firebase push notifications for FutureMeal ready alerts
6. Add image upload via AWS S3 with `@PostMapping("/upload")` in food/restaurant controllers
7. Implement restaurant search with Elasticsearch for fuzzy matching
8. Add Redis caching for restaurant lists and popular foods

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture documentation.

---

Made with ❤️ for Indian food lovers
