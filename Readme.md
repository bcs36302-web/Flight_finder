# ✈ Flight Price Finder

Flight Price Finder is a full-stack application that helps users discover flights that are **cheaper than the historical average price** for a given route and time period.

The system aggregates flight data from multiple APIs, calculates average prices for a **day, week, or quarter**, and highlights flights that are **below the average price**.

Users can optionally receive alerts via **WhatsApp and Telegram** when cheap flights are detected.

---

# 🚀 Features

### Flight Search

Users can search flights by providing:

* **Origin airport (IATA code)**
* **Destination airport (IATA code)**
* **Time window**

  * Day
  * Week
  * Quarter

Example:

```
FROM: DEL
TO: LHR
Quarter: Q2
Year: 2026
```

---

### Price Intelligence

The backend system:

1. Fetches flight data from APIs
2. Calculates the **average price**
3. Identifies flights **below the average**
4. Displays the **percentage difference**

Example output:

```
Average price: ₹52,000

Flights below average:

₹48,000  (7.6% below avg)
₹45,500  (12.5% below avg)
₹42,000  (19.2% below avg)
```

---

### Notifications

Users can optionally subscribe to alerts:

* WhatsApp notifications
* Telegram bot notifications

Example alert:

```
✈ Flight Deal Found

Route: DEL → LHR
Price: ₹45,000
12% cheaper than average
```

---

# 📱 Applications

The system includes:

### Web App

Browser-based interface.

### Mobile App

Cross-platform mobile application supporting:

* Android
* iOS

---

# 🧠 Core Idea

Instead of showing just the cheapest flight, the system provides **context**:

```
Is this flight actually cheap?
```

By comparing prices against historical averages, users can make smarter booking decisions.

---

# ⚙ Tech Stack

Frontend

* React / Next.js

Mobile

* React Native
* Expo

Backend

* Node.js / Python
* REST API

Database

* PostgreSQL

External APIs

* Amadeus
* Kiwi Tequila API

Messaging

* WhatsApp Business API
* Telegram Bot API

---

# 📊 Example UI

Search Page:

* Enter route
* Select time period
* Optional alert subscription

Results Page:

```
Average Price: ₹52,000

Flights below average:

1. Emirates — ₹45,500
2. British Airways — ₹48,000
3. Virgin Atlantic — ₹42,000
```

---

# 📌 Project Goal

Help travelers **find truly cheap flights** using data-driven insights rather than random search results.
