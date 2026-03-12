# System Rules and Constraints

These rules define the behavior of the system.

---

# Input Rules

Users must provide:

* valid IATA origin code
* valid IATA destination code
* valid time window

Example valid inputs:

```
DEL
LHR
JFK
DXB
```

---

# Price Analysis Rules

Average price calculation:

```
average = sum(prices) / number_of_prices
```

A flight is considered **cheap** if:

```
flight_price < average_price
```

Percentage below average:

```
((average - price) / average) * 100
```

---

# Alert Rules

Notifications are triggered only if:

```
price < average_price
```

Optional threshold:

```
price < average_price * 0.90
```

Meaning:

```
10% cheaper than average
```

---

# API Usage Rules

External flight APIs may have:

* rate limits
* request quotas
* authentication keys

The system must:

* cache responses
* limit API calls
* retry failed requests

---

# Security Rules

Sensitive data must never be exposed:

* API keys
* user phone numbers
* chat IDs

All secrets must be stored in:

```
.env
```

---

# Data Integrity Rules

System must validate:

* price > 0
* valid airline code
* valid timestamps
* non-null route values

Invalid records must be discarded.
