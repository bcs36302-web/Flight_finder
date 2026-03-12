# System Architecture

The Flight Price Finder system follows a **multi-layer architecture**.

```
User
 │
 ├── Web Application
 └── Mobile Application
        │
        ▼
      Backend API
        │
        ├── Flight Data Fetcher
        ├── Price Analysis Engine
        ├── Alert System
        │
        ▼
       Database
        │
        ▼
   External Flight APIs
```

---

# Components

## 1 Frontend Layer

Two clients interact with the backend.

### Web App

Browser interface.

Responsibilities:

* Search flights
* Display average price
* Display cheap flights

### Mobile App

Cross-platform mobile application.

Features:

* Search interface
* Notifications
* Saved routes

---

# 2 Backend Layer

The backend performs all data processing.

Responsibilities:

* Query flight APIs
* Store results
* Compute averages
* Detect cheap flights
* Trigger alerts

Endpoints example:

```
POST /search
POST /subscribe
GET /results
```

---

# 3 Price Analysis Engine

Core logic:

```
avg_price = sum(all_prices) / count(all_prices)

cheap_flights =
    flights where price < avg_price
```

Percentage calculation:

```
percent_below =
((avg_price - flight_price) / avg_price) * 100
```

---

# 4 Database

Stores:

* flight data
* user alert subscriptions
* search history

Example tables:

```
flights
routes
subscriptions
users
```

---

# 5 External APIs

The system aggregates data from:

* Amadeus flight API
* Kiwi Tequila API

These APIs return:

* airlines
* prices
* flight duration
* departure times

---

# 6 Alert System

If cheap flights are detected:

1. system evaluates threshold
2. notification triggered

Channels:

* WhatsApp
* Telegram
