1Data Format Specification

This document defines all data formats used in the system.

---

# Flight Search Request

Example request:

```
POST /search
```

Payload:

```
{
  "from": "DEL",
  "to": "LHR",
  "quarter": "Q2",
  "year": 2026,
  "whatsapp": "919876543210",
  "telegram_chat_id": "123456789"
}
```

---

# Flight Record

Example flight object:

```
{
  "airline": "Emirates",
  "price": 45000,
  "departure": "2026-04-12",
  "arrival": "2026-04-12",
  "duration": "9h 10m",
  "flight_number": "EK511"
}
```

---

# Analysis Output

Example response:

```
{
  "average_price": 52000,
  "flights_below_average": [
    {
      "airline": "Emirates",
      "price": 45000,
      "percent_below": 13.4
    },
    {
      "airline": "British Airways",
      "price": 48000,
      "percent_below": 7.6
    }
  ]
}
```

---

# Database Schema

Example table:

```
flights

id
origin
destination
airline
price
departure_time
arrival_time
date
```

---

# Alert Subscription

```
subscriptions

id
origin
destination
quarter
year
whatsapp
telegram_chat_id
created_at
```
