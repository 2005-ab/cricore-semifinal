import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import ScorecardTab from './ScorecardTab';
import RatingTab from './RatingTab';

// Mapping full team names to short forms
const teamShortForms = {
  "Chennai Super Kings": "CSK",
  "Mumbai Indians": "MI",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Punjab Kings": "PBKS",
  "Sunrisers Hyderabad": "SRH",
  "Rajasthan Royals": "RR",
  "Lucknow Super Giants": "LSG",
  "Delhi Capitals": "DC",
  "Royal Challengers Bengaluru": "RCB"
};

// Helper functions for strike rate and economy color coding
const getStrikeRateColor = (sr) => {
  const value = parseFloat(sr);
  if (isNaN(value)) return 'white';
  if (value < 100) return 'red';
  else if (value < 150) return 'yellow';
  else if (value < 200) return 'green';
  else return 'cyan';
};

const getEconomyColor = (eco) => {
  const value = parseFloat(eco);
  if (isNaN(value)) return 'white';
  if (value < 6) return 'cyan';
  else if (value < 8) return 'green';
  else if (value < 10) return 'yellow';
  else return 'red';
};

const MatchDetailsScreen = ({ route, navigation }) => {
  const { matchId, season } = route.params;
  const [matchDetails, setMatchDetails] = useState({});
  const [activeTab, setActiveTab] = useState('Summary');

  // For Ratings tab – extract batting and bowling data (if available)
  const battingData = matchDetails.battingData ? Object.values(matchDetails.battingData) : [];
  const bowlingData = matchDetails.bowlingData ? Object.values(matchDetails.bowlingData) : [];
  const winningTeam = matchDetails.WinningTeam || '';

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        let url = "";
        if (season === "2024") {
          // Use the IPL 2024 summary URL
          url = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/148-matchschedule.js?MatchSchedule=_jqjsp&_1743401104110=";
        } else {
          // Use the IPL 2025 summary URL
          url = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/203-matchschedule.js?MatchSchedule=_jqjsp&_1743400682690=";
        }
        const response = await fetch(url);
        const text = await response.text();
        // Remove any wrapper text if present
        const jsonStr = text.replace('MatchSchedule(', '').replace(');', '');
        const data = JSON.parse(jsonStr);
        if (data && data.Matchsummary) {
          // Find the match based on matchId (ensuring both are strings)
          const match = data.Matchsummary.find(m => m.MatchID.toString() === matchId.toString());
          if (match) {
            // Transform the data as needed
            const transformedData = {
              ...match,
              HomeTeamName: match.FirstBattingTeamName,
              AwayTeamName: match.SecondBattingTeamName,
              // For summary, you might also map innings summaries if available
              '1Summary': match['1Summary'] || "",
              '2Summary': match['2Summary'] || "",
              // Optionally include other fields as necessary
            };
            setMatchDetails(transformedData);
          } else {
            console.error("Match not found in summary data");
          }
        } else {
          console.error("Invalid data format received");
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
      }
    };
    fetchMatchDetails();
  }, [matchId, season]);

  // Helper to replace full team names with short forms
  const replaceTeamNames = (text) => {
    if (!text) return text;
    let replacedText = text;
    Object.keys(teamShortForms).forEach((fullName) => {
      replacedText = replacedText.replace(new RegExp(fullName, 'g'), teamShortForms[fullName]);
    });
    return replacedText;
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Team Logos and Short Form Names */}
        <View style={styles.teamLogosContainer}>
          <View style={styles.teamContainer}>
            {matchDetails.HomeTeamLogo && (
              <Image source={{ uri: matchDetails.HomeTeamLogo }} style={styles.teamLogo} />
            )}
            <Text style={styles.teamName}>
              {teamShortForms[matchDetails.HomeTeamName] || matchDetails.HomeTeamName}
            </Text>
          </View>
          <Text style={styles.vsText}>V/S</Text>
          <View style={styles.teamContainer}>
            {matchDetails.AwayTeamLogo && (
              <Image source={{ uri: matchDetails.AwayTeamLogo }} style={styles.teamLogo} />
            )}
            <Text style={styles.teamName}>
              {teamShortForms[matchDetails.AwayTeamName] || matchDetails.AwayTeamName}
            </Text>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setActiveTab('Summary')}>
            <Text style={[styles.tab, activeTab === 'Summary' && styles.activeTab]}>
              Summary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Scorecard')}>
            <Text style={[styles.tab, activeTab === 'Scorecard' && styles.activeTab]}>
              Scorecard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Ratings')}>
            <Text style={[styles.tab, activeTab === 'Ratings' && styles.activeTab]}>
              Ratings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Summary' ? (
          <View>
            {/* Man of the Match Section */}
            {matchDetails.MOM && (
              <View style={styles.momSection}>
                {matchDetails.MOMImage && (
                  <Image source={{ uri: matchDetails.MOMImage }} style={styles.momImage} />
                )}
                <View style={styles.momInfo}>
                  <Text style={styles.momTitle}>MAN OF THE MATCH</Text>
                  <Text style={styles.momName}>{matchDetails.MOM}</Text>
                  <Text style={styles.momStats}>
                    Runs: {matchDetails.MOMRuns} | Wickets: {matchDetails.MOMWicket}/{matchDetails.MOMRC}
                  </Text>
                  {matchDetails.MOMStrikeRate && (
                    <Text style={[styles.momAdditional, { color: getStrikeRateColor(matchDetails.MOMStrikeRate) }]}>
                      Strike Rate: {matchDetails.MOMStrikeRate}
                    </Text>
                  )}
                  {matchDetails.MOMEconomy && (
                    <Text style={[styles.momAdditional, { color: getEconomyColor(matchDetails.MOMEconomy) }]}>
                      Economy: {matchDetails.MOMEconomy}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Toss Details */}
            <Text style={styles.tossText}>
              Toss: {replaceTeamNames(matchDetails.TossDetails)}
            </Text>

            {/* Team Scores */}
            <View style={styles.teamScoresContainer}>
              <View style={styles.teamContainer}>
                {matchDetails.HomeTeamLogo && (
                  <Image source={{ uri: matchDetails.HomeTeamLogo }} style={styles.smallLogo} />
                )}
                <Text style={styles.teamScore}>{matchDetails['1Summary']}</Text>
                <Text style={styles.teamName}>
                  {teamShortForms[matchDetails.HomeTeamName] || matchDetails.HomeTeamName}
                </Text>
              </View>
              <View style={styles.teamContainer}>
                {matchDetails.AwayTeamLogo && (
                  <Image source={{ uri: matchDetails.AwayTeamLogo }} style={styles.smallLogo} />
                )}
                <Text style={styles.teamScore}>{matchDetails['2Summary']}</Text>
                <Text style={styles.teamName}>
                  {teamShortForms[matchDetails.AwayTeamName] || matchDetails.AwayTeamName}
                </Text>
              </View>
            </View>

            {/* Match Result */}
            <View style={styles.resultContainer}>
              <Text style={styles.resultText} numberOfLines={1} ellipsizeMode="tail">
                {replaceTeamNames(matchDetails.Comments || matchDetails.Commentss)}
              </Text>
            </View>
          </View>
        ) : activeTab === 'Scorecard' ? (
          <ScorecardTab matchId={matchId} season={season} />
        ) : (
          // Ratings Tab
          <RatingTab 
            matchId={matchId}
            winningTeam={winningTeam}
          />
        )}
      </ScrollView>

      {/* Stadium Name at the Bottom */}
      <View style={styles.stadiumContainer}>
        <Text style={styles.stadiumText}>
          {teamShortForms[matchDetails.GroundName] || matchDetails.GroundName}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 80,
  },
  teamLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  teamContainer: {
    alignItems: 'center',
  },
  teamLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  teamName: {
    fontSize: 18,
    color: 'white',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    margin: 16,
  },
  tab: {
    fontSize: 18,
    color: '#AAAAAA',
  },
  activeTab: {
    color: 'white',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  momSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  momImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  momInfo: {
    flex: 1,
  },
  momTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  momName: {
    fontSize: 18,
    color: 'white',
  },
  momStats: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  momAdditional: {
    fontSize: 16,
    marginTop: 4,
  },
  tossText: {
    fontSize: 18,
    color: '#00BFFF',
    textAlign: 'center',
    marginVertical: 12,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  teamScoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
  },
  smallLogo: {
    width: 60,
    height: 60,
  },
  teamScore: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: 4,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultText: {
    fontSize: 20,
    color: '#FF6347',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stadiumContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    paddingVertical: 10,
    alignItems: 'center',
  },
  stadiumText: {
    fontSize: 20,
    color: '#AAAAAA',
  },
});

export default MatchDetailsScreen;
