import { useState } from 'react';
import '../index.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://flight-finder-qskv.onrender.com';

interface Flight {
  airline: string;
  price: number;
  percent_below: number;
  flight_number?: string;
}

interface SearchResults {
  average_price: number;
  flights_below_average: Flight[];
}

function App() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('LHR');
  const [quarter, setQuarter] = useState('Q2');
  const [year, setYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          from: origin,
          to: destination,
          quarter,
          year: parseInt(year),
        }),
      });

      if (!response.ok) {
        throw new Error('Could not connect to the flight search API. Please check your connection.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16.5L13 11.5V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V11.5L2 16.5V19L10 16.5V21.5L8 23V25L11.5 24L15 25V23L13 21.5V16.5L21 19V16.5Z" fill="#60A5FA" />
          </svg>
        </div>
        <h1>Flight Price Finder</h1>
        <p className="subtitle">
          Advanced analytics to find flights 10% below market average — powered by Amadeus & Kiwi APIs
        </p>
      </header>

      <main>
        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="input-grid">
              <div className="input-group">
                <label>From (IATA)</label>
                <input 
                  type="text" 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                  placeholder="e.g. DEL"
                  maxLength={3}
                  required
                />
              </div>
              <div className="input-group">
                <label>To (IATA)</label>
                <input 
                  type="text" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                  placeholder="e.g. LHR"
                  maxLength={3}
                  required
                />
              </div>
              <div className="input-group">
                <label>Quarter</label>
                <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
                  <option value="Q1">Q1 — Jan-Mar</option>
                  <option value="Q2">Q2 — Apr-Jun</option>
                  <option value="Q3">Q3 — Jul-Sep</option>
                  <option value="Q4">Q4 — Oct-Dec</option>
                </select>
              </div>
              <div className="input-group">
                <label>Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026" selected>2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Analyzing Market Data...
                </>
              ) : (
                <>Analyze Prices</>
              )}
            </button>
          </form>
        </div>

        {results && (
          <div className="results-container">
            <div className="result-header">
              <h2>Market Opportunity Analysis</h2>
              <div className="avg-price-tag">
                Global Average: <span style={{color: '#F8FAFC', marginLeft: '0.5rem'}}>₹{results.average_price.toLocaleString()}</span>
              </div>
            </div>

            {results.flights_below_average.length > 0 ? (
              results.flights_below_average.map((flight, index) => (
                <div key={index} className="flight-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="airline-info">
                    <span className="airline-name">{flight.airline}</span>
                    <span className="flight-details">Professional Route Optimization Active</span>
                  </div>
                  <div className="price-info">
                    <div className="price-main">
                      ₹{flight.price.toLocaleString()}
                      <span className="off-badge">{flight.percent_below}% BELOW AVG</span>
                    </div>
                    <span className="flight-details">Estimated Direct Booking Savings</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="error-box" style={{backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--glass-border)', color: 'var(--text-dim)'}}>
                No exceptional deals found for this specific period. 
                Market prices are currently stable.
              </div>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>Enterprise Grade Flight Intelligence Platform</p>
        <p style={{marginTop: '0.5rem', opacity: 0.6}}>© 2026 FlightFinder Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
