import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { database, ref, onValue } from '../firebase.js';
import TOTSManager from '../utils/TOTSManager';

const TOTS = () => {
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [tots2024, setTots2024] = useState(null);
  const [ratings2025, setRatings2025] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load 2024 TOTS
    const totsRef = ref(database, 'tots/2024');
    const unsubscribe2024 = onValue(totsRef, (snapshot) => {
      if (snapshot.exists()) {
        setTots2024(snapshot.val());
      }
      setLoading(false);
    });

    // Load 2025 ratings
    const ratingsRef = ref(database, 'RATINGS_CRICORE/2025');
    const unsubscribe2025 = onValue(ratingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setRatings2025(snapshot.val());
      }
      setLoading(false);
    });

    return () => {
      unsubscribe2024();
      unsubscribe2025();
    };
  }, []);

  const render2024TOTS = () => {
    if (!tots2024) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IPL 2024 Team of the Season</Text>
        <View style={styles.playerList}>
          {tots2024.wicketkeeper && (
            <View style={styles.playerCard}>
              <Text style={styles.playerName}>{tots2024.wicketkeeper.playerName}</Text>
              <Text style={styles.playerTeam}>{tots2024.wicketkeeper.team}</Text>
              <Text style={styles.playerRole}>Wicketkeeper</Text>
            </View>
          )}
          {tots2024.batsmen.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.playerName}</Text>
              <Text style={styles.playerTeam}>{player.team}</Text>
              <Text style={styles.playerRole}>Batsman</Text>
            </View>
          ))}
          {tots2024.bowlers.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.playerName}</Text>
              <Text style={styles.playerTeam}>{player.team}</Text>
              <Text style={styles.playerRole}>Bowler</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const render2025Ratings = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IPL 2025 Player Ratings</Text>
        <View style={styles.playerList}>
          {ratings2025.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <Text style={styles.playerName}>{player.playerName}</Text>
              <Text style={styles.playerTeam}>{player.team}</Text>
              <Text style={styles.playerRating}>Avg Rating: {player.averageRating.toFixed(2)}</Text>
              <Text style={styles.playerMatches}>Matches: {player.matchesPlayed}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.seasonSelector}>
        <TouchableOpacity 
          style={[styles.seasonButton, selectedSeason === '2024' && styles.selectedSeason]}
          onPress={() => setSelectedSeason('2024')}
        >
          <Text style={styles.seasonButtonText}>2024 TOTS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.seasonButton, selectedSeason === '2025' && styles.selectedSeason]}
          onPress={() => setSelectedSeason('2025')}
        >
          <Text style={styles.seasonButtonText}>2025 Ratings</Text>
        </TouchableOpacity>
      </View>

      {selectedSeason === '2024' ? render2024TOTS() : render2025Ratings()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  seasonButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedSeason: {
    backgroundColor: '#007AFF',
  },
  seasonButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  playerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerTeam: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  playerRole: {
    fontSize: 14,
    color: '#007AFF',
  },
  playerRating: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 5,
  },
  playerMatches: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default TOTS; 