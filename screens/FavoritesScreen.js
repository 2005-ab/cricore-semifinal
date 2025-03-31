import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, onValue } from '../firebase';

const FavoritesScreen = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!userProfile?.favoriteTeams?.length) {
      setLoading(false);
      return;
    }

    const matchesRef = ref(database, 'matches');
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allMatches = Object.values(data);
        const favoriteMatches = allMatches.filter(match => 
          userProfile.favoriteTeams.includes(match.team1) || 
          userProfile.favoriteTeams.includes(match.team2)
        );
        setMatches(favoriteMatches);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.favoriteTeams]);

  const filterMatches = (status) => {
    const now = new Date();
    return matches.filter(match => {
      const matchDate = new Date(match.date);
      switch (status) {
        case 'upcoming':
          return matchDate > now;
        case 'completed':
          return matchDate < now && match.status === 'Completed';
        case 'live':
          return match.status === 'Live';
        default:
          return true;
      }
    });
  };

  const renderMatchCard = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetailsScreen', { matchId: match.id })}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.matchDate}>{new Date(match.date).toLocaleDateString()}</Text>
        <Text style={styles.matchTime}>{new Date(match.date).toLocaleTimeString()}</Text>
      </View>
      <View style={styles.teamsContainer}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: match.team1Logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.team1}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.teamContainer}>
          <Image source={{ uri: match.team2Logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{match.team2}</Text>
        </View>
      </View>
      <Text style={styles.venue}>{match.venue}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!userProfile?.favoriteTeams?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite teams selected</Text>
        <TouchableOpacity
          style={styles.selectTeamsButton}
          onPress={() => navigation.navigate('FavoriteTeams')}
        >
          <Text style={styles.selectTeamsButtonText}>Select Teams</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.matchesContainer}>
        {filterMatches(activeTab).map(renderMatchCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectTeamsButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  selectTeamsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    padding: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  matchesContainer: {
    flex: 1,
    padding: 10,
  },
  matchCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  matchDate: {
    color: '#FFD700',
    fontSize: 14,
  },
  matchTime: {
    color: '#FFD700',
    fontSize: 14,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  vsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  venue: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FavoritesScreen; 