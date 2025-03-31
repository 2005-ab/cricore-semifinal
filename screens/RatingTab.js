import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import TOTSManager from '../utils/TOTSManager';

// Mapping for short team names
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

// Add team colors mapping
const teamColors = {
  "Chennai Super Kings": "#FFD700", // Yellow
  "Mumbai Indians": "#004BA0", // Blue
  "Royal Challengers Bengaluru": "#FF0000", // Red
  "Kolkata Knight Riders": "#2E0854", // Purple
  "Rajasthan Royals": "#FF69B4", // Pink
  "Delhi Capitals": "#004C99", // Blue
  "Sunrisers Hyderabad": "#FF822A", // Orange
  "Punjab Kings": "#FF0000", // Red
  "Gujarat Titans": "#0C4B8C", // Dark Blue
  "Lucknow Super Giants": "#004BA0", // Blue
};

const RatingTab = ({ matchId, winningTeam }) => {
  const [battingData, setBattingData] = useState([]);
  const [bowlingData, setBowlingData] = useState([]);
  const [playerRatings, setPlayerRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch innings data from the API
  useEffect(() => {
    const fetchInningsData = async () => {
      // Don't fetch if no matchId
      if (!matchId) {
        setError('Please select a match to view ratings');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Log the matchId being used
        console.log('Current matchId:', matchId);
        
        // Build URLs with matchId
        const urlInnings1 = `https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/${matchId}-Innings1.js?callback=onScoring`;
        const urlInnings2 = `https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/${matchId}-Innings2.js?callback=onScoring`;

        console.log('Fetching URLs:', { urlInnings1, urlInnings2 });

        // Try fetching each URL separately to identify which one fails
        try {
          const res1 = await fetch(urlInnings1);
          console.log('Innings1 Response:', {
            status: res1.status,
            ok: res1.ok,
            statusText: res1.statusText
          });

          const res2 = await fetch(urlInnings2);
          console.log('Innings2 Response:', {
            status: res2.status,
            ok: res2.ok,
            statusText: res2.statusText
          });

          if (!res1.ok) {
            throw new Error(`Failed to fetch Innings1 data. Status: ${res1.status}`);
          }
          if (!res2.ok) {
            throw new Error(`Failed to fetch Innings2 data. Status: ${res2.status}`);
          }

          const text1 = await res1.text();
          const text2 = await res2.text();

          console.log('Response lengths:', { 
            innings1: text1.length, 
            innings2: text2.length 
          });

          // Check if response text starts with "<" (HTML error)
          if (text1.trim().charAt(0) === '<' || text2.trim().charAt(0) === '<') {
            throw new Error('Scorecard data not available yet');
          }

          // Remove the callback wrapper (onScoring(...))
          const jsonStr1 = text1.replace(/^onScoring\(/, '').replace(/\);?$/, '');
          const jsonStr2 = text2.replace(/^onScoring\(/, '').replace(/\);?$/, '');

          try {
            const innings1Obj = JSON.parse(jsonStr1).Innings1;
            const innings2Obj = JSON.parse(jsonStr2).Innings2;

            console.log('Successfully parsed data for both innings');

            // Combine batting and bowling data from both innings
            const combinedBatting = [
              ...(innings1Obj.BattingCard || []),
              ...(innings2Obj.BattingCard || [])
            ];
            const combinedBowling = [
              ...(innings1Obj.BowlingCard || []),
              ...(innings2Obj.BowlingCard || [])
            ];

            console.log('Combined data:', {
              battingCount: combinedBatting.length,
              bowlingCount: combinedBowling.length
            });

            setBattingData(combinedBatting);
            setBowlingData(combinedBowling);
            setLoading(false);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Failed to parse innings data. Please check the response format.');
          }
        } catch (fetchError) {
          console.error('Fetch Error Details:', fetchError);
          throw new Error(`Failed to fetch data: ${fetchError.message}`);
        }
      } catch (err) {
        console.error('Main Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchInningsData();
  }, [matchId]);

  // Merge batting and bowling stats by PlayerID
  const mergePlayerStats = (batting = [], bowling = []) => {
    const merged = {};
    batting.forEach(item => {
      const id = item.PlayerID;
      merged[id] = { 
        playerId: id, 
        playerName: item.PlayerName.trim(), 
        batting: item, 
        team: item.TeamName ? item.TeamName.trim() : ''
      };
    });
    bowling.forEach(item => {
      const id = item.PlayerID;
      if (merged[id]) {
        merged[id].bowling = item;
        if (!merged[id].team && item.TeamName) {
          merged[id].team = item.TeamName.trim();
        }
      } else {
        merged[id] = { 
          playerId: id, 
          playerName: item.PlayerName.trim(), 
          bowling: item, 
          team: item.TeamName ? item.TeamName.trim() : ''
        };
      }
    });
    return Object.values(merged);
  };

  // Calculate batting component (40-50% weight)
  const calculateBattingComponent = (bat) => {
    let score = 0;
    let breakdown = {};
    
    // Base runs score (40% of batting component)
    const runs = bat.Runs || 0;
    const balls = bat.Balls || 0;
    const strikeRate = bat.StrikeRate || 0;
    
    // Base points for runs (normalized to 10-point scale)
    breakdown.runs = runs * 0.1; // 1 run = 0.1 points
    score += runs * 0.1;

    // Strike rate multiplier (30% of batting component)
    if (strikeRate >= 200) { breakdown.strikeRate200 = 1.0; score += 1.0; }
    else if (strikeRate >= 180) { breakdown.strikeRate180 = 0.8; score += 0.8; }
    else if (strikeRate >= 150) { breakdown.strikeRate150 = 0.6; score += 0.6; }
    else if (strikeRate >= 120) { breakdown.strikeRate120 = 0.4; score += 0.4; }
    else if (strikeRate < 100 && balls >= 10) { breakdown.strikeRateLow = -0.2; score += -0.2; }

    // Boundary bonus (20% of batting component)
    const fours = bat.Fours || 0;
    const sixes = bat.Sixes || 0;
    breakdown.fours = fours * 0.4; // 1 four = 0.4 points
    breakdown.sixes = sixes * 0.6; // 1 six = 0.6 points
    score += (fours * 0.4) + (sixes * 0.6);

    // Milestone bonuses (10% of batting component)
    if (runs >= 100) { breakdown.century = 1.6; score += 1.6; }
    else if (runs >= 75) { breakdown.run75 = 1.2; score += 1.2; }
    else if (runs >= 50) { breakdown.halfCentury = 0.8; score += 0.8; }
    else if (runs >= 25) { breakdown.run25 = 0.4; score += 0.4; }

    // Penalty for duck
    if (runs === 0 && balls > 0) { breakdown.duck = -0.2; score += -0.2; }

    return { score, breakdown };
  };

  // Calculate bowling component (30-40% weight)
  const calculateBowlingComponent = (bowl) => {
    let score = 0;
    let breakdown = {};
    
    const wickets = bowl.Wickets || 0;
    const overs = parseFloat(bowl.Overs) || 0;
    const runsConceded = bowl.Runs || 0;
    const maidens = bowl.Maidens || 0;
    const economy = parseFloat(bowl.Economy) || 0;
    const dotBalls = bowl.DotBalls || 0;

    // Wicket points (40% of bowling component)
    breakdown.wickets = wickets * 2.5; // 1 wicket = 2.5 points
    score += wickets * 2.5;

    // Wicket milestone bonuses (20% of bowling component)
    if (wickets >= 5) { breakdown.wicketBonus = 1.2; score += 1.2; }
    else if (wickets === 4) { breakdown.wicketBonus = 0.8; score += 0.8; }
    else if (wickets === 3) { breakdown.wicketBonus = 0.4; score += 0.4; }

    // Economy rate (20% of bowling component)
    if (overs > 0) {
      if (economy <= 5 && economy >= 1) { breakdown.economy = 0.8; score += 0.8; }
      else if (economy < 6 && economy >= 1) { breakdown.economy = 0.6; score += 0.6; }
      else if (economy < 7 && economy >= 1) { breakdown.economy = 0.4; score += 0.4; }
      else if (economy >= 10 && economy <= 11) { breakdown.economy = -0.2; score += -0.2; }
      else if (economy > 11 && economy <= 12) { breakdown.economy = -0.4; score += -0.4; }
      else if (economy > 12) { breakdown.economy = -0.6; score += -0.6; }
    }

    // Dot balls and maidens (20% of bowling component)
    breakdown.dotBalls = dotBalls * 0.2; // 1 dot ball = 0.2 points
    breakdown.maidens = maidens * 1.5; // 1 maiden = 1.5 points
    score += (dotBalls * 0.2) + (maidens * 1.5);

    return { score, breakdown };
  };

  // Calculate fielding component (10-15% weight)
  const calculateFieldingComponent = (bat, bowl) => {
    let score = 0;
    let breakdown = {};
    
    // Catches and stumpings
    const catches = (bat.Catches || 0) + (bowl.Catches || 0);
    const stumpings = (bat.Stumpings || 0) + (bowl.Stumpings || 0);
    
    breakdown.catches = catches * 1.0; // 1 catch = 1.0 point
    breakdown.stumpings = stumpings * 1.5; // 1 stumping = 1.5 points
    score += (catches * 1.0) + (stumpings * 1.5);

    // Run-outs
    const runOuts = (bat.RunOuts || 0) + (bowl.RunOuts || 0);
    breakdown.runOuts = runOuts * 1.2; // 1 run-out = 1.2 points
    score += runOuts * 1.2;

    return { score, breakdown };
  };

  // Calculate match impact component (10-15% weight)
  const calculateMatchImpact = (player, isWinningTeam) => {
    let score = 0;
    let breakdown = {};
    
    // Team bonus/penalty
    if (isWinningTeam) {
      breakdown.teamBonus = 1.5; // 1.5 points for winning team
      score += 1.5;
    } else {
      breakdown.teamPenalty = -0.5; // -0.5 points for losing team
      score += -0.5;
    }

    return { score, breakdown };
  };

  // Main rating calculation function
  const calculatePlayerRating = (player) => {
    const bat = player.batting || {};
    const bowl = player.bowling || {};
    const isWinningTeam = player.team === winningTeam;

    // Calculate component scores
    const batting = calculateBattingComponent(bat);
    const bowling = calculateBowlingComponent(bowl);
    const fielding = calculateFieldingComponent(bat, bowl);
    const matchImpact = calculateMatchImpact(player, isWinningTeam);

    // Combine all breakdowns
    const breakdown = {
      ...batting.breakdown,
      ...bowling.breakdown,
      ...fielding.breakdown,
      ...matchImpact.breakdown
    };

    // Calculate total score with weights
    const totalScore = 
      batting.score * 0.50 +    // 50% weight for batting
      bowling.score * 0.40 +    // 40% weight for bowling
      fielding.score * 0.10;    // 10% weight for fielding

    return { rating: totalScore, breakdown };
  };

  // Merge and calculate ratings once data is fetched
  useEffect(() => {
    if (!loading && !error) {
      const mergedPlayers = mergePlayerStats(battingData, bowlingData);
      const ratedPlayers = mergedPlayers.map(player => {
        const { rating, breakdown } = calculatePlayerRating(player);
        return { ...player, rating, breakdown };
      });
      ratedPlayers.sort((a, b) => b.rating - a.rating);
      setPlayerRatings(ratedPlayers);
    }
  }, [battingData, bowlingData, loading, error, winningTeam]);

  // Update TOTS when ratings are calculated
  useEffect(() => {
    if (!loading && !error && playerRatings.length > 0) {
      TOTSManager.updateTOTS(playerRatings);
    }
  }, [playerRatings, loading, error]);

  const onPlayerPress = (player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  // Add function to get team color
  const getTeamColor = (teamName) => {
    return teamColors[teamName] || '#FFD700'; // Default to gold if team not found
  };

  // Update function to convert points to 10-point rating
  const convertToRating = (points) => {
    // Get all player ratings for this match
    const allPoints = playerRatings.map(p => p.rating);
    const maxPoints = Math.max(...allPoints);
    const minPoints = Math.min(...allPoints);
    
    // Calculate the range of points
    const range = maxPoints - minPoints;
    
    // If all players have the same points, return 6.5 (neutral rating)
    if (range === 0) return 6.5;
    
    // Calculate percentiles for different rating thresholds
    const sortedPoints = [...allPoints].sort((a, b) => a - b);
    const p90 = sortedPoints[Math.floor(sortedPoints.length * 0.9)]; // 90th percentile
    const p75 = sortedPoints[Math.floor(sortedPoints.length * 0.75)]; // 75th percentile
    const p50 = sortedPoints[Math.floor(sortedPoints.length * 0.5)]; // 50th percentile
    const p25 = sortedPoints[Math.floor(sortedPoints.length * 0.25)]; // 25th percentile
    const p10 = sortedPoints[Math.floor(sortedPoints.length * 0.1)]; // 10th percentile
    
    // Assign ratings based on percentiles
    if (points >= p90) {
      // Top 10% get ratings 9.0-10.0
      const topRange = maxPoints - p90;
      const rating = 9.0 + ((points - p90) / topRange);
      return Math.min(10.0, rating);
    } else if (points >= p75) {
      // Next 15% get ratings 8.0-9.0
      const range = p90 - p75;
      return 8.0 + ((points - p75) / range);
    } else if (points >= p50) {
      // Middle 25% get ratings 7.0-8.0
      const range = p75 - p50;
      return 7.0 + ((points - p50) / range);
    } else if (points >= p25) {
      // Next 25% get ratings 6.0-7.0
      const range = p50 - p25;
      return 6.0 + ((points - p25) / range);
    } else if (points >= p10) {
      // Next 15% get ratings 5.0-6.0
      const range = p25 - p10;
      return 5.0 + ((points - p10) / range);
    } else {
      // Bottom 10% get ratings 3.0-5.0
      const range = p10 - minPoints;
      return 3.0 + ((points - minPoints) / range) * 2;
    }
  };

  // Update function to get rating color
  const getRatingColor = (rating) => {
    if (rating >= 9) return '#00FFFF'; // Cyan for exceptional performance
    if (rating >= 8) return '#00FF00'; // Green for excellent performance
    if (rating >= 7) return '#FFFF00'; // Yellow for very good performance
    if (rating >= 6) return '#FFA500'; // Orange for decent performance
    if (rating >= 4) return '#FF6B6B'; // Light red for poor performance
    return '#FF0000'; // Dark red for very poor performance (3-4)
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Player Ratings</Text>
            <View style={styles.teamInfo}>
              <Image 
                source={{ uri: `https://media.cricbuzz.com/cricket-flags-new/${teamMapping[winningTeam]}.png` }}
                style={styles.teamLogo}
              />
              <Text style={styles.winningTeam}>{teamMapping[winningTeam]}</Text>
            </View>
          </View>
          <ScrollView style={styles.scrollView}>
            {playerRatings.length === 0 ? (
              <Text style={styles.noDataText}>No rating data available</Text>
            ) : (
              playerRatings.map(player => {
                const ratingOutOf10 = convertToRating(player.rating);
                return (
                  <TouchableOpacity key={player.playerId} onPress={() => onPlayerPress(player)} style={styles.playerRow}>
                    <View style={[styles.imageContainer, { borderColor: getTeamColor(player.team) }]}>
                      <Image 
                        source={{ uri: player.batting?.PlayerImage || player.bowling?.PlayerImage || 'https://via.placeholder.com/50' }} 
                        style={styles.playerImage} 
                      />
                    </View>
                    <View style={styles.playerInfo}>
                      <View style={styles.playerDetails}>
                        <Text style={styles.playerName}>{player.playerName}</Text>
                        <View style={styles.teamContainer}>
                          <Image 
                            source={{ uri: `https://media.cricbuzz.com/cricket-flags-new/${teamMapping[player.team]}.png` }}
                            style={styles.teamLogoSmall}
                          />
                          <Text style={styles.teamName}>{teamMapping[player.team]}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={[styles.ratingText, { color: getRatingColor(ratingOutOf10) }]}>
                        {ratingOutOf10.toFixed(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedPlayer && (
              <>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.modalHeader}>
                  <View style={styles.modalPlayerInfo}>
                    <Text style={styles.modalTitle}>{selectedPlayer.playerName}</Text>
                    <View style={styles.modalTeamContainer}>
                      <Image 
                        source={{ uri: `https://media.cricbuzz.com/cricket-flags-new/${teamMapping[selectedPlayer.team]}.png` }}
                        style={styles.modalTeamLogo}
                      />
                      <Text style={styles.modalTeamName}>{teamMapping[selectedPlayer.team]}</Text>
                    </View>
                  </View>
                  <View style={[styles.modalImageContainer, { borderColor: getTeamColor(selectedPlayer.team) }]}>
                    <Image 
                      source={{ uri: selectedPlayer.batting?.PlayerImage || selectedPlayer.bowling?.PlayerImage || 'https://via.placeholder.com/50' }} 
                      style={styles.modalPlayerImage} 
                    />
                  </View>
                </View>
                <View style={styles.modalRatingContainer}>
                  <Text style={styles.modalRatingLabel}>Rating</Text>
                  <Text style={[styles.modalRating, { color: getRatingColor(convertToRating(selectedPlayer.rating)) }]}>
                    {convertToRating(selectedPlayer.rating).toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.modalSubtitle}>Stats</Text>
                <ScrollView style={styles.breakdownScrollView}>
                  <View style={styles.breakdownContainer}>
                    <View style={styles.breakdownSection}>
                      <Text style={styles.breakdownSectionTitle}>Batting</Text>
                      {selectedPlayer.batting && (
                        <>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Runs</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.batting.Runs || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Balls</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.batting.Balls || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Strike Rate</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.batting.StrikeRate || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Fours</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.batting.Fours || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Sixes</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.batting.Sixes || 0}</Text>
                          </View>
                          {(selectedPlayer.batting.Runs === 0 && selectedPlayer.batting.Balls > 0) && (
                            <View style={styles.breakdownRow}>
                              <Text style={styles.breakdownLabel}>Duck</Text>
                              <Text style={[styles.breakdownValue, styles.negativeValue]}>Yes</Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                    <View style={styles.breakdownSection}>
                      <Text style={styles.breakdownSectionTitle}>Bowling</Text>
                      {selectedPlayer.bowling && (
                        <>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Wickets</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.Wickets || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Overs</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.Overs || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Runs</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.Runs || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Economy</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.Economy || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Dot Balls</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.DotBalls || 0}</Text>
                          </View>
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Maidens</Text>
                            <Text style={styles.breakdownValue}>{selectedPlayer.bowling.Maidens || 0}</Text>
                          </View>
                        </>
                      )}
                    </View>
                    <View style={styles.breakdownSection}>
                      <Text style={styles.breakdownSectionTitle}>Fielding</Text>
                      {((selectedPlayer.batting?.Catches || 0) + (selectedPlayer.bowling?.Catches || 0) > 0) && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Catches</Text>
                          <Text style={styles.breakdownValue}>
                            {(selectedPlayer.batting?.Catches || 0) + (selectedPlayer.bowling?.Catches || 0)}
                          </Text>
                        </View>
                      )}
                      {((selectedPlayer.batting?.Stumpings || 0) + (selectedPlayer.bowling?.Stumpings || 0) > 0) && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Stumpings</Text>
                          <Text style={styles.breakdownValue}>
                            {(selectedPlayer.batting?.Stumpings || 0) + (selectedPlayer.bowling?.Stumpings || 0)}
                          </Text>
                        </View>
                      )}
                      {((selectedPlayer.batting?.RunOuts || 0) + (selectedPlayer.bowling?.RunOuts || 0) > 0) && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Run Outs</Text>
                          <Text style={styles.breakdownValue}>
                            {(selectedPlayer.batting?.RunOuts || 0) + (selectedPlayer.bowling?.RunOuts || 0)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  mainContainer: { flex: 1 },
  headerContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  heading: { 
    fontSize: 24, 
    color: '#FFD700', 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 10,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  winningTeam: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: { flex: 1 },
  playerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1, 
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogoSmall: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  teamName: { 
    color: '#888', 
    fontSize: 14,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  playerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBackground: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: '#1a1a1a', 
    padding: 20, 
    borderRadius: 15, 
    width: '90%', 
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
    padding: 3,
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  modalPlayerImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  modalPlayerInfo: {
    alignItems: 'center',
  },
  modalTeamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  modalTeamLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  modalTitle: { 
    fontSize: 28, 
    color: '#FFD700', 
    fontWeight: 'bold', 
    marginBottom: 5,
    textAlign: 'center',
  },
  modalTeamName: { 
    fontSize: 18, 
    color: '#888',
  },
  modalRatingContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalRatingLabel: { 
    fontSize: 16, 
    color: '#888', 
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: { 
    fontSize: 20, 
    color: '#FFD700', 
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breakdownScrollView: {
    maxHeight: 450,
  },
  breakdownContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  breakdownSection: {
    marginBottom: 15,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  breakdownSectionTitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: { 
    color: '#fff', 
    fontSize: 15,
    flex: 1,
  },
  breakdownValue: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: 'bold',
    marginLeft: 10,
  },
  positiveValue: { color: '#4CAF50' },
  negativeValue: { color: '#FF6B6B' },
});

export default RatingTab;