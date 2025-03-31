import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { SeasonContext } from '../App';

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const { selectedSeason, setSelectedSeason } = React.useContext(SeasonContext);
  const [activeTab, setActiveTab] = useState("completed");
  const navigation = useNavigation();

  useEffect(() => {
    if (selectedSeason === "2024") {
      fetchIPL2024Matches();
    } else {
      fetchIPL2025Matches();
    }
  }, [selectedSeason]);

  const fetchIPL2024Matches = async () => {
    try {
      const response = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/148-matchschedule.js?MatchSchedule=_jqjsp&_1743330500947=');
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Extract the JSON data from the MatchSchedule wrapper
      const jsonStr = text.replace('MatchSchedule(', '').replace(');', '');
      const data = JSON.parse(jsonStr);
      
      if (data && data.Matchsummary) {
        const matchesArray = data.Matchsummary.map(match => ({
          id: match.MatchID.toString(),
          MatchID: match.MatchID,
          RowNo: match.RowNo,
          HomeTeamName: match.FirstBattingTeamName,
          AwayTeamName: match.SecondBattingTeamName,
          HomeTeamLogo: match.HomeTeamLogo,
          AwayTeamLogo: match.AwayTeamLogo,
          GroundName: match.GroundName,
          Comments: match.Comments,
          Status: match.MatchStatus === "Post" ? "completed" : 
                 match.MatchStatus === "Live" ? "live" : "upcoming",
          MatchDate: match.MatchDateNew,
          MatchTime: match.MatchTime
        }));
        setMatches(matchesArray);
      } else {
        console.error("Invalid data format received");
        setMatches([]);
      }
      
    } catch (error) {
      console.error("Error fetching IPL 2024 matches:", error);
      setMatches([]);
      
    }
  };

  const fetchIPL2025Matches = async () => {
    try {
      const response = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/203-matchschedule.js?MatchSchedule=_jqjsp&_1743328127358=');
      const text = await response.text();
      
      // Extract the JSON data from the MatchSchedule wrapper
      const jsonStr = text.replace('MatchSchedule(', '').replace(');', '');
      const data = JSON.parse(jsonStr);
      
      if (data && data.Matchsummary) {
        const matchesArray = data.Matchsummary.map(match => ({
          id: match.MatchID.toString(),
          MatchID: match.MatchID,
          RowNo: match.RowNo,
          HomeTeamName: match.FirstBattingTeamName,
          AwayTeamName: match.SecondBattingTeamName,
          HomeTeamLogo: match.HomeTeamLogo,
          AwayTeamLogo: match.AwayTeamLogo,
          GroundName: match.GroundName,
          Comments: match.Result || match.Comments,
          Status: match.MatchStatus === "Post" ? "completed" : 
                 match.MatchStatus === "Live" ? "live" : "upcoming",
          MatchDate: match.MatchDate,
          MatchTime: match.MatchTime
        }));
        setMatches(matchesArray);
      }
    } catch (error) {
      console.error("Error fetching IPL 2025 matches:", error);
    }
  };

  const getMatchLabel = (rowNo) => {
    if (rowNo === 74) return "Final";
    if (rowNo === 73) return "Qualifier 2";
    if (rowNo === 72) return "Eliminator";
    if (rowNo === 71) return "Qualifier 1";
    return `Match No: ${rowNo}`;
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === "completed") return match.Status === "completed";
    if (activeTab === "live") return match.Status === "live";
    if (activeTab === "upcoming") return match.Status === "upcoming";
    return true;
  });

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.matchContainer}
      onPress={() => navigation.navigate("MatchDetailsScreen", { matchId: item.MatchID, season: selectedSeason })}
    >
      <View style={styles.topBar}>
        <Text style={styles.iplText}>IPL {selectedSeason}</Text>
        <Text style={styles.matchNo}>{getMatchLabel(item.RowNo)}</Text>
      </View>

      <View style={styles.matchRow}>
        <View style={styles.teamContainerLeft}>
          <Image 
            source={{ uri: item.HomeTeamLogo || 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/placeholder.png' }} 
            style={styles.teamLogo} 
          />
          <Text style={styles.teamName}>{item.HomeTeamName}</Text>
        </View>

        <Text style={styles.vsText}>v/s</Text>

        <View style={styles.teamContainerRight}>
          <Image 
            source={{ uri: item.AwayTeamLogo || 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/placeholder.png' }} 
            style={styles.teamLogo} 
          />
          <Text style={styles.teamName}>{item.AwayTeamName}</Text>
        </View>
      </View>

      <Text style={styles.details}>{item.GroundName}</Text>
      <Text style={styles.details}>{item.Comments}</Text>
      <Text style={styles.details}>{item.MatchDate} {item.MatchTime}</Text>
    </TouchableOpacity>
  );

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

      {/* Status Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "live" && styles.activeTab]}
          onPress={() => setActiveTab("live")}
        >
          <Text style={[styles.tabText, activeTab === "live" && styles.activeTabText]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={filteredMatches} keyExtractor={(item) => item.id} renderItem={renderMatchItem} />
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
  },
  picker: {
    color: "#FFD700",
    height: 40,
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
  matchContainer: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#FFD700",
    position: "relative",
  },
  topBar: {
    position: "absolute",
    top: 5,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
  },
  iplText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  matchNo: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 20,
  },
  teamContainerLeft: {
    alignItems: "center",
    flex: 1,
  },
  teamContainerRight: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  teamName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    width: 100,
  },
  vsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 0.5,
  },
  details: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 5,
  },
});

export default MatchesScreen;
