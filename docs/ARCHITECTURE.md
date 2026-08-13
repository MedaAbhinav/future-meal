# FutureMeal — Architecture

## Overview

FutureMeal is a full-stack Indian food delivery platform with a unique meal-planning feature.
It follows a clean three-tier architecture: React frontend → Spring Boot REST API → MySQL.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Pages   │  │Components│  │ Context  │  │    Services    │  │
│  │  (lazy)  │  │  (UI)    │  │Auth+Cart │  │ axios + JWT    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                           HTTP/JSON (JWT Bearer)
┌───────────────────────────▼─────────────────────────────────────┐
│                  BACKEND (Spring Boot 3.2)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Controllers │  │   Services   │  │   Recommendation    │   │
│  │  (REST APIs) │→ │  (Business)  │→ │   Engine (pluggable)│   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Repositories│  │  Entities    │  │  Security (JWT+RBAC)│   │
│  │  (JPA)       │  │  (JPA/Hib.)  │  │  Spring Security    │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                           JPA/JDBC
┌───────────────────────────▼─────────────────────────────────────┐
│                      DATABASE (MySQL 8.x)                        │
│  users · restaurants · food_items · orders · future_meals       │
│  carts · addresses · reviews · notifications                    │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Layer Responsibilities

| Layer        | Package                  | Responsibility                         |
|-------------|--------------------------|----------------------------------------|
| Controller  | `controller/`            | HTTP routing, request validation, auth |
| Service     | `service/impl/`          | Business logic, transactions           |
| Repository  | `repository/`            | Data access (Spring Data JPA)          |
| Entity      | `entity/`                | JPA domain model                       |
| DTO         | `dto/request|response/`  | API contract (no entity leakage)       |
| Security    | `security/`              | JWT filter, UserDetailsService         |
| Config      | `config/`                | Spring beans, CORS, Swagger, Seeder    |
| Exception   | `exception/`             | Global error handler, custom exceptions|

## FutureMeal Engine Architecture

```
FutureMealController
       │
       ▼
FutureMealServiceImpl
       │
       ├─► RecommendationEngine (interface)
       │         ├─► DeterministicRecommendationEngine  ← default (always active)
       │         └─► AIRecommendationEngine             ← future (pluggable)
       │
       └─► AIService (interface)
                 ├─► NoOpAIService          ← default when AI_ENABLED=false
                 └─► OpenAIService          ← when AI_ENABLED=true (to implement)
```

### Scoring Weights (DeterministicRecommendationEngine)

| Factor         | Weight | Logic                                    |
|---------------|--------|------------------------------------------|
| Budget match  | 30%    | Price vs budget proximity                |
| Availability  | 20%    | Restaurant open + food available         |
| Distance      | 15%    | Rating as quality proxy (GPS-extensible) |
| Delivery time | 15%    | Faster = higher score                    |
| Rating        | 10%    | Combined food + restaurant rating        |
| Preference    | 10%    | Dietary + spice + cuisine match          |

Weights are configurable in `application.yml` without code changes.

## Frontend Architecture

```
src/
├── main.tsx              ← entry point
├── App.tsx               ← router + providers
├── context/              ← AuthContext, CartContext
├── services/             ← API layer (axios)
├── pages/                ← route-level components (lazy loaded)
├── components/
│   ├── ui/               ← Button, Input, Badge, Modal, Skeleton
│   ├── layout/           ← Navbar, Footer, CartDrawer, ProtectedRoute
│   ├── food/             ← FoodCard
│   ├── restaurant/       ← RestaurantCard
│   ├── cart/             ← CartDrawer
│   ├── order/            ← order components
│   └── futuremeal/       ← FutureMeal-specific components
├── utils/                ← formatters, images, validators, seedData
└── types/                ← TypeScript interfaces
```

## Authentication Flow

```
1. User registers/logs in → POST /api/auth/register|login
2. Server validates, issues JWT (24h) + refresh token (7d)
3. Client stores tokens in localStorage
4. Every request includes: Authorization: Bearer <token>
5. JwtAuthenticationFilter validates token on each request
6. SecurityUtils.getCurrentUser() resolves user from context
7. On 401 → axios interceptor attempts token refresh
8. On refresh failure → redirect to /login
```

## Role-Based Access Control

| Role             | Accessible APIs                                    |
|-----------------|----------------------------------------------------|
| CUSTOMER        | /api/cart, /api/orders, /api/future-meals, /api/users |
| RESTAURANT_OWNER| /api/owner/**, /api/restaurants (GET)              |
| DELIVERY_PARTNER| /api/delivery/**                                   |
| ADMIN           | /api/admin/**, all above                           |

All roles can: GET /api/restaurants, GET /api/foods, POST /api/auth/*
