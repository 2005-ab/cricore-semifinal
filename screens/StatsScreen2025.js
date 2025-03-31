import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Picker } from '@react-native-picker/picker';

const StatsScreen2025 = () => {
  const [activeTab, setActiveTab] = useState("batting");
  const [topBatters, setTopBatters] = useState([]);
  const [topBowlers, setTopBowlers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState("2025");

  useEffect(() => {
    fetchIPL2025Stats();
  }, []);

  const fetchIPL2025Stats = async () => {
    try {
      // Fetch batting stats
      const battingResponse = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-toprunsscorers.js?callback=ontoprunsscorers&_=1743333648645');
      const battingText = await battingResponse.text();
      const battingJsonStr = battingText.replace('ontoprunsscorers(', '').replace(');', '');
      const battingData = JSON.parse(battingJsonStr);

      // Fetch bowling stats
      const bowlingResponse = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-mostwickets.js?callback=onmostwickets&_=1743333648646');
      const bowlingText = await bowlingResponse.text();
      const bowlingJsonStr = bowlingText.replace('onmostwickets(', '').replace(');', '');
      const bowlingData = JSON.parse(bowlingJsonStr);

      if (battingData && battingData.toprunsscorers) {
        setTopBatters(battingData.toprunsscorers);
      }
      if (bowlingData && bowlingData.mostwickets) {
        setTopBowlers(bowlingData.mostwickets);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching IPL 2025 stats:", error);
      setLoading(false);
    }
  };

  const getPlayerImageUrl = (name) => {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1);
      return `https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/${firstName}%20${lastName}.png`;
    }
    return null;
  };

  const renderBattingStats = () => {
    if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
    
    return (
      <ScrollView>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Most Runs</Text>
          {topBatters
            .sort((a, b) => parseInt(b.TotalRuns) - parseInt(a.TotalRuns))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.TotalRuns}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Best Strike Rate</Text>
          {topBatters
            .sort((a, b) => parseFloat(b.StrikeRate) - parseFloat(a.StrikeRate))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.StrikeRate}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Most Fours</Text>
          {topBatters
            .sort((a, b) => parseInt(b.Fours) - parseInt(a.Fours))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.Fours}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Most Sixes</Text>
          {topBatters
            .sort((a, b) => parseInt(b.Sixes) - parseInt(a.Sixes))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.Sixes}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Most Fifties</Text>
          {topBatters
            .sort((a, b) => parseInt(b.FiftyPlusRuns) - parseInt(a.FiftyPlusRuns))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.FiftyPlusRuns}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Most Hundreds</Text>
          {topBatters
            .sort((a, b) => parseInt(b.Centuries) - parseInt(a.Centuries))
            .slice(0, 5)
            .map((batter, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(batter.StrikerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{batter.StrikerName}</Text>
                <Text style={styles.statValue}>{batter.Centuries}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    );
  };

  const renderBowlingStats = () => {
    if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
    
    return (
      <ScrollView>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Most Wickets</Text>
          {topBowlers
            .sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets))
            .slice(0, 5)
            .map((bowler, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(bowler.BowlerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{bowler.BowlerName}</Text>
                <Text style={styles.statValue}>{bowler.Wickets}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Best Economy</Text>
          {topBowlers
            .sort((a, b) => parseFloat(a.EconomyRate) - parseFloat(b.EconomyRate))
            .slice(0, 5)
            .map((bowler, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(bowler.BowlerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{bowler.BowlerName}</Text>
                <Text style={styles.statValue}>{bowler.EconomyRate}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Best Strike Rate</Text>
          {topBowlers
            .sort((a, b) => parseFloat(a.StrikeRate) - parseFloat(b.StrikeRate))
            .slice(0, 5)
            .map((bowler, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(bowler.BowlerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{bowler.BowlerName}</Text>
                <Text style={styles.statValue}>{bowler.StrikeRate}</Text>
              </View>
            ))}

          <Text style={styles.sectionTitle}>Most Dot Balls</Text>
          {topBowlers
            .sort((a, b) => parseInt(b.DotBallsBowled) - parseInt(a.DotBallsBowled))
            .slice(0, 5)
            .map((bowler, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Image 
                  source={{ uri: getPlayerImageUrl(bowler.BowlerName) }} 
                  style={styles.playerImage}
                />
                <Text style={styles.playerName}>{bowler.BowlerName}</Text>
                <Text style={styles.statValue}>{bowler.DotBallsBowled}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Season Selector */}
      <View style={styles.seasonSelector}>
        <Picker
          selectedValue={selectedSeason}
          onValueChange={(value) => setSelectedSeason(value)}
          style={styles.picker}
        >
          <Picker.Item label="IPL 2024" value="2024" />
          <Picker.Item label="IPL 2025" value="2025" />
        </Picker>
      </View>

      {/* Stats Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "batting" && styles.activeTab]}
          onPress={() => setActiveTab("batting")}
        >
          <Text style={[styles.tabText, activeTab === "batting" && styles.activeTabText]}>Batting</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "bowling" && styles.activeTab]}
          onPress={() => setActiveTab("bowling")}
        >
          <Text style={[styles.tabText, activeTab === "bowling" && styles.activeTabText]}>Bowling</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "batting" ? renderBattingStats() : renderBowlingStats()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 10,
  },
  seasonSelector: {
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 10,
    padding: 5,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    color: "#FFD700",
    height: 50,
    width: '100%',
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 10,
    padding: 5,
  },
  tab: {
    padding: 10,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#000",
  },
  statsContainer: {
    padding: 10,
  },
  sectionTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  rank: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    width: 30,
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  playerName: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    marginLeft: 5,
  },
  statValue: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    width: 60,
    textAlign: "right",
  },
  loadingText: {
    color: "#FFD700",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default StatsScreen2025; 