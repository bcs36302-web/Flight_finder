import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  Image,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'https://flight-finder-qskv.onrender.com'; // Permanent Render Cloud URL

export default function App() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('LHR');
  const [quarter, setQuarter] = useState('Q2 — Apr-Jun');
  const [year, setYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuarterPicker, setShowQuarterPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const quarters = [
    'Q1 — Jan-Mar',
    'Q2 — Apr-Jun',
    'Q3 — Jul-Sep',
    'Q4 — Oct-Dec'
  ];

  const years = ['2024', '2025', '2026', '2027'];

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Extract code from quarter label if needed (e.g. "Q2 — Apr-Jun" -> "Q2")
      const quarterCode = quarter.split(' ')[0];
      
      const response = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          from: origin,
          to: destination,
          quarter: quarterCode,
          year: parseInt(year),
        }),
      });

      if (!response.ok) throw new Error('Could not connect to the flight search API. Make sure the backend is running.');
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="airplane" size={60} color="#60A5FA" style={styles.logoIcon} />
          </View>
          <Text style={styles.title}>Flight Price Finder</Text>
          <Text style={styles.subtitle}>Find flights 10% below average — or the cheapest available</Text>
        </View>

        {/* Search Card */}
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FROM (IATA)</Text>
              <TextInput 
                style={styles.input} 
                value={origin} 
                onChangeText={setOrigin} 
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TO (IATA)</Text>
              <TextInput 
                style={styles.input} 
                value={destination} 
                onChangeText={setDestination} 
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>QUARTER</Text>
              <TouchableOpacity 
                style={styles.pickerContainer}
                onPress={() => setShowQuarterPicker(true)}
              >
                <TextInput 
                  style={styles.input} 
                  value={quarter} 
                  editable={false}
                  pointerEvents="none"
                />
                <Ionicons name="chevron-down" size={20} color="#94A3B8" style={styles.pickerIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>YEAR</Text>
              <TouchableOpacity 
                style={styles.pickerContainer}
                onPress={() => setShowYearPicker(true)}
              >
                <TextInput 
                  style={styles.input} 
                  value={year} 
                  editable={false}
                  pointerEvents="none"
                />
                <Ionicons name="chevron-down" size={20} color="#94A3B8" style={styles.pickerIcon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Alerts Section */}
          <Text style={styles.sectionTitle}>OPTIONAL: GET ALERTS</Text>
          
          <View style={styles.alertGroup}>
            <Text style={styles.labelSecondary}>WhatsApp number (with country code, no +)</Text>
            <TextInput 
              style={styles.inputSecondary} 
              placeholder="e.g. 919876543210" 
              placeholderTextColor="#475569"
            />
          </View>

          <View style={styles.alertGroup}>
            <Text style={styles.labelSecondary}>Telegram chat ID</Text>
            <TextInput 
              style={styles.inputSecondary} 
              placeholder="e.g. 123456789" 
              placeholderTextColor="#475569"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Search Button */}
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search Flights</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {results && !loading && (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Market Opportunity Analysis</Text>
              <View style={styles.avgBadge}>
                <Text style={styles.avgBadgeText}>Global Avg: ₹{results.average_price?.toLocaleString()}</Text>
              </View>
            </View>
            {(results.all_flights || results.flights_below_average || []).map((f: any, i: number) => {
              const pct = f.percent_vs_avg ?? f.percent_below ?? 0;
              const isBelow = pct < 0;
              const dep = f.departure && f.departure !== 'N/A' ? (() => {
                try {
                  const d = new Date(f.departure);
                  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                } catch { return f.departure; }
              })() : null;
              return (
                <View key={i} style={[styles.flightCard, i % 2 === 0 ? styles.flightCardAlt : null]}>
                  <View style={styles.flightLeft}>
                    <View style={styles.flightTopRow}>
                      <Text style={styles.flightAirline}>{f.airline}</Text>
                      {f.flight_number ? <Text style={styles.flightNo}>{f.flight_number}</Text> : null}
                    </View>
                    <View style={styles.flightMeta}>
                      {dep ? <Text style={styles.flightMetaText}>🕒 {dep}</Text> : null}
                      {f.duration && f.duration !== 'N/A' ? <Text style={styles.flightMetaText}> • ⏳ {f.duration}</Text> : null}
                    </View>
                  </View>
                  <View style={styles.flightRight}>
                    <Text style={styles.flightPrice}>₹{f.price?.toLocaleString()}</Text>
                    <View style={[styles.pctBadge, isBelow ? styles.pctBelow : styles.pctAbove]}>
                      <Text style={[styles.pctBadgeText, isBelow ? styles.pctBelowText : styles.pctAboveText]}>
                        {isBelow ? `${Math.abs(pct)}% BELOW` : `${pct}% ABOVE`}
                      </Text>
                    </View>
                    <Text style={styles.flightSub}>Direct Booking</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.footer}>Powered by Amadeus + Kiwi Tequila APIs</Text>
      </ScrollView>

      {/* Quarter Picker Modal */}
      <Modal
        visible={showQuarterPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuarterPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowQuarterPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quarter</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {quarters.map((q) => (
                <TouchableOpacity 
                  key={q} 
                  style={styles.modalOption}
                  onPress={() => {
                    setQuarter(q);
                    setShowQuarterPicker(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, quarter === q && styles.modalOptionSelected]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowYearPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {years.map((y) => (
                <TouchableOpacity 
                  key={y} 
                  style={styles.modalOption}
                  onPress={() => {
                    setYear(y);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, year === y && styles.modalOptionSelected]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep Navy
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 20,
    transform: [{ rotate: '-15deg' }]
  },
  logoIcon: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1E293B', // Slightly lighter navy
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 0.48,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#334155',
    height: 54,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'relative',
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 17,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10,
    opacity: 0.5,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 15,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  alertGroup: {
    marginBottom: 20,
  },
  labelSecondary: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputSecondary: {
    backgroundColor: '#1E293B',
    height: 54,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
  },
  resultsTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avgBadge: {
    backgroundColor: '#1E3A5F',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  avgBadgeText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  flightCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#263548',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  flightCardAlt: {
    backgroundColor: '#1E2E3F',
  },
  flightLeft: {
    flex: 1,
    marginRight: 10,
  },
  flightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  flightAirline: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 6,
  },
  flightNo: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  flightMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  flightMetaText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  flightRight: {
    alignItems: 'flex-end',
  },
  flightPrice: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '800',
  },
  pctBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  pctBelow: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  pctAbove: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  pctBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pctBelowText: {
    color: '#10B981',
  },
  pctAboveText: {
    color: '#F87171',
  },
  flightSub: {
    color: '#475569',
    fontSize: 10,
    marginTop: 3,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalOptionText: {
    color: '#94A3B8',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOptionSelected: {
    color: '#3B82F6',
    fontWeight: '800',
  }
});
