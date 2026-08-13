# FutureMeal Feature — Complete Technical Documentation

## What is FutureMeal?

FutureMeal is the core differentiator of this platform. It lets users **plan a meal intention for a future moment** instead of placing an order immediately.

### User Story
> "I want Hyderabadi biryani after my exam on Friday around 7:30 PM, preferably under ₹250 and not too spicy."

The user creates this as a FutureMeal plan. The system watches available restaurants, evaluates pricing, availability, and delivery times as the planned moment approaches, then presents a smart recommendation exactly when the user needs it.

---

## Lifecycle

```
PLANNED ──► MATCH_FOUND ──► READY ──► ORDERED
   │              │             │
   ▼              ▼             ▼
POSTPONED      CANCELLED     CANCELLED
   │
   ▼
EXPIRED (if date passes without action)
```

### Status Definitions

| Status       | Meaning                                               |
|-------------|-------------------------------------------------------|
| PLANNED     | Created. Engine is actively watching.                 |
| MATCH_FOUND | A good match found, but planned time not yet reached. |
| READY       | Within 30-minute window. Recommendation ready to order. |
| ORDERED     | User ordered from the recommendation.                 |
| POSTPONED   | User deferred to a new date/time.                     |
| CANCELLED   | User cancelled.                                       |
| EXPIRED     | Planned time passed without any action.               |

---

## Evaluation Engine

### Trigger
The `FutureMealServiceImpl.scheduledEvaluation()` runs every **5 minutes** (configurable).

It evaluates all `PLANNED` or `MATCH_FOUND` meals where:
- `planned_date = today`
- `planned_time BETWEEN now AND now + 35 minutes`

### Candidate Selection
Queries `food_items` for items matching:
1. `price <= maxBudget × 1.2` (20% buffer)
2. Dietary type match (or null for NON_VEG)
3. Spice level match
4. Restaurant is open
5. Food is available

### Scoring (DeterministicRecommendationEngine)

For each candidate food item, a composite score (0–100) is computed:

```
score = budgetScore    × 0.30
      + availScore     × 0.20
      + distanceScore  × 0.15
      + deliveryScore  × 0.15
      + ratingScore    × 0.10
      + prefScore      × 0.10
```

**Budget Score:**
- price ≤ 80% of budget → 1.0
- price ≤ budget       → 0.8
- price ≤ budget×1.1   → 0.4
- price ≤ budget×1.2   → 0.1
- over budget          → 0.0

**Availability Score:**
- Restaurant open + food available → 1.0; else → 0.0

**Distance Score:**
- Uses restaurant rating as quality proxy (rating 2..5 → 0..1)
- GPS-based scoring can be plugged in via same interface

**Delivery Score:**
- ≤15 min → 1.0; ≥60 min → 0.0; linear between

**Rating Score:**
- (foodRating + restaurantRating) / 2 / 5

**Preference Score:**
- Dietary match: 1.0 if matches, 0.0 if not
- Spice match: 1.0 if within 1 level, 0.5 otherwise
- Cuisine match: 1.0 if matches, 0.3 if not
- Preferred restaurant bonus: +1.0 if matches

**Minimum threshold:** score ≥ 40.0 to be recommended.

---

## AI Extension Point

The `AIService` interface provides three hooks:

```java
Optional<AIRecommendationResult> generateMealRecommendation(FutureMeal, candidates);
String explainRecommendation(FutureMeal, FoodItem);
Optional<ParsedMealIntent> parseFutureMealIntent(String naturalLanguageInput);
```

**To enable AI:**
1. Set `AI_ENABLED=true` in environment
2. Set `AI_PROVIDER=openai` (or `gemini`)
3. Set `AI_API_KEY=sk-...`
4. Implement `OpenAIRecommendationService implements AIService`
5. Annotate with `@ConditionalOnProperty(name="app.ai.enabled", havingValue="true")`

The application falls back to `DeterministicRecommendationEngine` automatically when AI is not configured.

---

## API Reference

| Method | Endpoint                        | Description                         |
|--------|---------------------------------|-------------------------------------|
| POST   | /api/future-meals               | Create a new FutureMeal plan        |
| GET    | /api/future-meals               | Get all my FutureMeals              |
| GET    | /api/future-meals/{id}          | Get FutureMeal by ID                |
| PUT    | /api/future-meals/{id}          | Update plan (only PLANNED status)   |
| PATCH  | /api/future-meals/{id}/cancel   | Cancel                              |
| PATCH  | /api/future-meals/{id}/postpone | Postpone to new date/time           |
| POST   | /api/future-meals/{id}/evaluate | Manually trigger evaluation         |
| POST   | /api/future-meals/{id}/order    | Convert READY plan to actual order  |
| DELETE | /api/future-meals/{id}          | Delete                              |

---

## Example FutureMeal JSON

```json
{
  "description": "Chicken biryani after exam, not too spicy",
  "plannedDate": "2026-08-15",
  "plannedTime": "19:30",
  "maxBudget": 250,
  "cuisine": "BIRYANI",
  "dietaryPreference": "NON_VEG",
  "spicePreference": "MEDIUM",
  "deliveryAddressId": 1,
  "specialConditions": "No onion if possible"
}
```

### Recommendation Response (when READY)
```json
{
  "status": "READY",
  "recommendedFoodItem": {
    "name": "Chicken Dum Biryani",
    "price": 229,
    "rating": 4.7,
    "preparationTime": 25
  },
  "recommendedRestaurant": {
    "name": "Spice Route Biryani",
    "rating": 4.6,
    "deliveryTime": 28
  },
  "recommendationScore": 87.4,
  "recommendationReason": "This match fits your budget of ₹250, highly rated restaurant (4.6★), fast delivery in ~28 min, bestseller item.",
  "isAIRecommended": false
}
```
