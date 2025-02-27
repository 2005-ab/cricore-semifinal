import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const StatsScreen = () => {
  const [battingStats, setBattingStats] = useState([]);
  const [bowlingStats, setBowlingStats] = useState([]);
  const [mvpStats, setMvpStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Batting');
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const battingRef = ref(database, 'ipl_stats/batting');
    const bowlingRef = ref(database, 'ipl_stats/bowling');
    const mvpRef = ref(database, 'ipl_stats/mvp');

    onValue(battingRef, (snapshot) => {
      if (snapshot.exists()) {
        setBattingStats(Object.values(snapshot.val()));
      }
      setLoading(false);
    });

    onValue(bowlingRef, (snapshot) => {
      if (snapshot.exists()) {
        setBowlingStats(Object.values(snapshot.val()));
      }
      setLoading(false);
    });

    onValue(mvpRef, (snapshot) => {
      if (snapshot.exists()) {
        setMvpStats(Object.values(snapshot.val()));
      }
      setLoading(false);
    });
  }, []);

  const getSortedPlayers = (statKey, stats, ascending = false) => {
    return [...stats].sort((a, b) => ascending ? (a[statKey] || 0) - (b[statKey] || 0) : (b[statKey] || 0) - (a[statKey] || 0));
  };

  const renderStatCategory = (title, statKey, stats, showAverage = false, ascending = false) => {
    const players = getSortedPlayers(statKey, stats, ascending);
    const isExpanded = expandedCategory === statKey;
    const displayedPlayers = isExpanded ? players.slice(0, 10) : players.slice(0, 3);

    return (
      <View style={styles.categoryContainer}>
        <Pressable onPress={() => setExpandedCategory(isExpanded ? null : statKey)} style={styles.headerRow}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </Pressable>

        <FlatList
          data={displayedPlayers}
          keyExtractor={(item) => item.Name + statKey}
          renderItem={({ item, index }) => (
            <View style={[styles.statRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
              <Text style={styles.playerText}>{index + 1}. {item.Name} ({item.Team})</Text>
              <Text style={styles.statValue}>
                {showAverage
                  ? item[statKey] ? item[statKey].toFixed(2) : 'N/A'
                  : item[statKey] || 'N/A'}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>STATS</Text>

      <View style={styles.tabContainer}>
        {['Batting', 'Bowling', 'MVP'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, activeTab === tab && styles.activeTab]}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Batting' && (
        <>
          {renderStatCategory('Most Runs', 'Runs', battingStats)}
          {renderStatCategory('Best Batting Average', 'Batting Average', battingStats, true)}
          {renderStatCategory('Best Strike Rate', 'Strike Rate', battingStats)}
          {renderStatCategory('Most Hundreds', 'Centuries', battingStats)}
          {renderStatCategory('Most Fifties', 'Fifties', battingStats)}
          {renderStatCategory('Most Sixes', 'Sixes', battingStats)}
        </>
      )}

      {activeTab === 'Bowling' && (
        <>
          {renderStatCategory('Most Wickets', 'Wickets', bowlingStats)}
          {renderStatCategory('Best Economy', 'Economy', bowlingStats, false, true)}
          {renderStatCategory('Best Bowling Strike Rate', 'Bowling SR', bowlingStats, false, true)}
          {renderStatCategory('Most Dot Balls', 'Dot Balls', bowlingStats)}
        </>
      )}

      {activeTab === 'MVP' && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>MVP Rankings</Text>
          <FlatList
            data={getSortedPlayers('Points', mvpStats).slice(0, 20)}
            keyExtractor={(item) => item.Name + 'MVP'}
            renderItem={({ item, index }) => (
              <View style={[styles.statRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                <Text style={styles.playerText}>{index + 1}. {item.Name} ({item.Team})</Text>
                <Text style={styles.statValue}>{item.Points || 'N/A'}</Text>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#1e1e1e" },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 22, fontWeight: '700', fontStyle: 'italic', textAlign: 'center', marginBottom: 15, color: '#FFFFFF', fontFamily: 'PT Serif' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#333' },
  activeTab: { backgroundColor: '#FFD700' },
  tabText: { color: '#FFF', fontWeight: 'bold' },
  categoryContainer: { marginBottom: 12, backgroundColor: "#222", borderRadius: 10, padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFD700' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 5 },
  rowEven: { backgroundColor: '#333' },
  rowOdd: { backgroundColor: '#444' },
  playerText: { fontSize: 14, color: '#FFF', flex: 1 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#FFD700' },
});

export default StatsScreen;