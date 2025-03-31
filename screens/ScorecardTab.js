import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';

const teamMapping = {
  "Chennai Super Kings": "CSK",
  "Mumbai Indians": "MI",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Punjab Kings": "PK",
  "Sunrisers Hyderabad": "SRH",
  "Rajasthan Royals": "RR",
  "Lucknow Super Giants": "LSG",
  "Delhi Capitals": "DC",
  "Royal Challengers Bengaluru": "RCB"
};

const ScorecardTab = ({ matchId, season }) => {
  const [innings1Batting, setInnings1Batting] = useState([]);
  const [innings2Batting, setInnings2Batting] = useState([]);
  const [innings2Bowling, setInnings2Bowling] = useState([]);
  const [innings1Bowling, setInnings1Bowling] = useState([]);
  const [innings1Total, setInnings1Total] = useState('');
  const [innings2Total, setInnings2Total] = useState('');
  const [innings1Team, setInnings1Team] = useState('');
  const [innings2Team, setInnings2Team] = useState('');
  const [activeTab, setActiveTab] = useState('innings1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        setLoading(true);
        setError(null);
        let computedMatchID;
        if (!matchId) {
          setError('No match ID provided');
          setLoading(false);
          return;
        }
        if (season === "2024") {
          computedMatchID = matchId;
        } else {
          const numericMatchId = Number(matchId);
          if (!isNaN(numericMatchId) && numericMatchId > 0) {
            computedMatchID = numericMatchId;
          } else {
            const parts = matchId.toString().split('_');
            const matchNumber = parts[1] ? parseInt(parts[1]) : 1;
            computedMatchID = 1799 + (matchNumber - 1);
          }
        }
        console.log('Fetching scorecard for match ID:', computedMatchID, 'Season:', season);
        const innings1Url = `https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/${computedMatchID}-Innings1.js?onScoring`;
        const innings2Url = `https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/${computedMatchID}-Innings2.js?onScoring`;
        
        // First try to fetch first innings data
        const response1 = await fetch(innings1Url);
        if (!response1.ok) {
          throw new Error('Failed to fetch first innings data');
        }
        const text1 = await response1.text();
        if (text1.trim().charAt(0) === '<') {
          setError('Match scorecard data not available yet');
          setLoading(false);
          return;
        }
        const jsonStr1 = text1.replace('onScoring(', '').replace(');', '');
        const innings1Data = JSON.parse(jsonStr1).Innings1;
        
        if (!innings1Data) {
          setError('Invalid match data received');
          setLoading(false);
          return;
        }

        const processBattingCard = (data) => {
          if (!data || !data.BattingCard) return [];
          return data.BattingCard.map(batsman => ({
            PlayerName: batsman.PlayerName.trim(),
            Runs: batsman.Runs,
            Balls: batsman.Balls,
            Fours: batsman.Fours,
            Sixes: batsman.Sixes,
            StrikeRate: batsman.StrikeRate,
            ShortOutDesc: batsman.ShortOutDesc,
            PlayerImage: batsman.PlayerImage
          }));
        };

        const processBowlingCard = (data) => {
          if (!data || !data.BowlingCard) return [];
          return data.BowlingCard.map(bowler => ({
            PlayerName: bowler.PlayerName.trim(),
            Overs: bowler.Overs,
            Maidens: bowler.Maidens,
            Runs: bowler.Runs,
            Wickets: bowler.Wickets,
            Economy: bowler.Economy,
            PlayerImage: bowler.PlayerImage
          }));
        };

        // Process first innings data
        setInnings1Batting(processBattingCard(innings1Data));
        setInnings1Bowling(processBowlingCard(innings1Data));
        if (innings1Data.Extras && innings1Data.Extras[0]) {
          setInnings1Total(innings1Data.Extras[0].Total);
          setInnings1Team(innings1Data.Extras[0].BattingTeamName ? innings1Data.Extras[0].BattingTeamName.trim() : '');
        } else if (innings1Data.BattingCard && innings1Data.BattingCard[0]) {
          setInnings1Team(innings1Data.BattingCard[0].TeamName ? innings1Data.BattingCard[0].TeamName.trim() : '');
        }

        // Try to fetch second innings data
        try {
          const response2 = await fetch(innings2Url);
          if (response2.ok) {
            const text2 = await response2.text();
            if (text2.trim().charAt(0) !== '<') {
              const jsonStr2 = text2.replace('onScoring(', '').replace(');', '');
              const innings2Data = JSON.parse(jsonStr2).Innings2;
              if (innings2Data) {
                setInnings2Batting(processBattingCard(innings2Data));
                setInnings2Bowling(processBowlingCard(innings2Data));
                if (innings2Data.Extras && innings2Data.Extras[0]) {
                  setInnings2Total(innings2Data.Extras[0].Total);
                  setInnings2Team(innings2Data.Extras[0].BattingTeamName ? innings2Data.Extras[0].BattingTeamName.trim() : '');
                } else if (innings2Data.BattingCard && innings2Data.BattingCard[0]) {
                  setInnings2Team(innings2Data.BattingCard[0].TeamName ? innings2Data.BattingCard[0].TeamName.trim() : '');
                }
              }
            }
          }
        } catch (err) {
          console.log('Second innings data not available yet');
          // Don't set error here as this is expected for live matches
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching scorecard:', err);
        setError('Failed to load match data. Please try again later.');
        setLoading(false);
      }
    };
    fetchScorecard();
  }, [matchId, season]);

  const getStrikeRateColor = (strikeRate) => {
    const sr = parseFloat(strikeRate);
    if (isNaN(sr)) return { color: '#fff' };
    if (sr < 100) return { color: 'red' };
    if (sr < 150) return { color: 'yellow' };
    if (sr < 200) return { color: 'green' };
    return { color: 'cyan' };
  };

  const getEconomyColor = (economy) => {
    const eco = parseFloat(economy);
    if (isNaN(eco)) return { color: '#fff' };
    if (eco < 6) return { color: 'cyan' };
    if (eco < 8) return { color: 'green' };
    if (eco < 10) return { color: 'yellow' };
    return { color: 'red' };
  };

  const formatName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length < 2) return name;
    return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
  };

  const formatDismissal = (dismissal) => {
    if (!dismissal) return 'Not Out';
    return dismissal.replace(/c ([A-Za-z]+) ([A-Za-z]+) b ([A-Za-z]+) ([A-Za-z]+)/g, 
      (match, f1, l1, f2, l2) => `c ${f1[0]}. ${l1} b ${f2[0]}. ${l2}`
    );
  };

  // Compute tab labels using short names
  const innings1Short = teamMapping[innings1Team] || innings1Team || "Innings 1";
  const innings2Short = teamMapping[innings2Team] || innings2Team || "Innings 2";
  const innings1Label = (innings1Total) ? `${innings1Short} (${innings1Total.split(' ')[0]})` : innings1Short;
  const innings2Label = (innings2Total) ? `${innings2Short} (${innings2Total.split(' ')[0]})` : innings2Short;

  // For each tab, show the batting card from that innings and the bowling card from the opposite innings.
  const renderTabButton = (label, tab) => {
    return (
      <TouchableOpacity
        style={[styles.tabButton, activeTab === tab && styles.activeTab]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={styles.tabText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderBattingCard = (innings, extras) => {
    const battersWithBalls = innings.filter(batter => parseInt(batter.Balls) > 0);
    const dnbBatters = innings.filter(batter => parseInt(batter.Balls) === 0);
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, styles.batterHeader]}>Batter</Text>
          <Text style={styles.headerText}>R</Text>
          <Text style={styles.headerText}>B</Text>
          <Text style={styles.headerText}>4s</Text>
          <Text style={styles.headerText}>6s</Text>
          <Text style={styles.headerText}>SR</Text>
        </View>
        {battersWithBalls.map((batter, index) => (
          <View key={`${batter.PlayerName}-${index}`} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Image 
                source={{ uri: batter.PlayerImage || 'https://via.placeholder.com/50' }} 
                style={styles.playerImage} 
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{formatName(batter.PlayerName)}</Text>
                <Text style={styles.dismissal}>
                  {batter.ShortOutDesc ? formatDismissal(batter.ShortOutDesc) : 'Not Out'}
                </Text>
              </View>
            </View>
            <Text style={styles.stats}>{batter.Runs}</Text>
            <Text style={styles.stats}>{batter.Balls}</Text>
            <Text style={styles.stats}>{batter.Fours}</Text>
            <Text style={styles.stats}>{batter.Sixes}</Text>
            <Text style={[styles.stats, getStrikeRateColor(batter.StrikeRate)]}>
              {batter.StrikeRate}
            </Text>
          </View>
        ))}
        {dnbBatters.length > 0 && (
          <Text style={styles.dnbText}>
            Did Not Bat: {dnbBatters.map(b => formatName(b.PlayerName)).join(', ')}
          </Text>
        )}
        <Text style={styles.totalText}>Extras: {extras}</Text>
      </View>
    );
  };

  const renderBowlingCard = (innings) => (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.batterHeader]}>Bowler</Text>
        <Text style={styles.headerText}>O</Text>
        <Text style={styles.headerText}>R</Text>
        <Text style={styles.headerText}>W</Text>
        <Text style={styles.headerText}>Econ</Text>
      </View>
      {innings.length > 0 ? (
        innings.map((bowler, index) => (
          <View key={`${bowler.PlayerName}-${index}`} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Image 
                source={{ uri: bowler.PlayerImage || 'https://via.placeholder.com/50' }} 
                style={styles.playerImage} 
              />
              <Text style={styles.playerName}>{formatName(bowler.PlayerName)}</Text>
            </View>
            <Text style={styles.stats}>{bowler.Overs || '0'}</Text>
            <Text style={styles.stats}>{bowler.Runs || '0'}</Text>
            <Text style={styles.stats}>{bowler.Wickets || '0'}</Text>
            <Text style={[styles.stats, getEconomyColor(bowler.Economy)]}>
              {bowler.Economy || '0.00'}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Match in Progress</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading match data...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            {renderTabButton(innings1Label, 'innings1')}
            {renderTabButton(innings2Label, 'innings2')}
          </View>
          {activeTab === 'innings1' ? (
            <>
              {renderBattingCard(innings1Batting, innings1Total.split(' ')[0])}
              {renderBowlingCard(innings1Bowling)}
            </>
          ) : (
            <>
              {renderBattingCard(innings2Batting, innings2Total.split(' ')[0])}
              {renderBowlingCard(innings2Bowling)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  cardContainer: { margin: 10, backgroundColor: '#1e1e1e', borderRadius: 12, padding: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  batterHeader: { flex: 3, textAlign: 'left' },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 3 },
  playerImage: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  playerName: { color: '#fff', fontSize: 14 },
  playerDetails: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  dismissal: { color: '#888', fontSize: 12 },
  stats: { color: '#fff', flex: 1, textAlign: 'center' },
  totalText: { color: '#fff', fontWeight: 'bold', marginTop: 8 },
  dnbText: { color: '#888', fontStyle: 'italic', marginTop: 8 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  tabButton: { paddingHorizontal: 20, paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderColor: '#FFD700' },
  tabText: { color: '#FFD700', fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#FFD700', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#FF6B6B', fontSize: 16, textAlign: 'center' },
});

export default ScorecardTab;

