import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getDatabase, ref, onValue } from "firebase/database";

const PointsTableScreen = () => {
  const [pointsTable, setPointsTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState("2024");

  useEffect(() => {
    if (selectedSeason === "2024") {
      fetchIPL2024PointsTable();
    } else {
      fetchIPL2025PointsTable();
    }
  }, [selectedSeason]);

  const fetchIPL2024PointsTable = async () => {
    try {
      const response = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/148-groupstandings.js?ongroupstandings=_jqjsp&_1743330321588=');
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Extract the JSON data from the ongroupstandings wrapper
      const jsonStr = text.replace('ongroupstandings(', '').replace(');', '');
      const data = JSON.parse(jsonStr);
      
      if (data && data.points) {
        const tableArray = data.points.map(team => ({
          id: team.TeamID,
          TeamName: team.TeamName,
          TeamCode: team.TeamCode,
          Matches: team.Matches,
          Won: team.Wins,
          Lost: team.Loss,
          Points: team.Points,
          NRR: team.NetRunRate,
          TeamLogo: team.TeamLogo
        }));
        setPointsTable(tableArray);
      } else {
        console.error("Invalid data format received");
        setPointsTable([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching IPL 2024 points table:", error);
      setPointsTable([]);
      setLoading(false);
    }
  };

  const fetchIPL2025PointsTable = async () => {
    try {
      const response = await fetch('https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/feeds/stats/203-groupstandings.js?ongroupstandings=_jqjsp&_1743329348914=');
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Extract the JSON data from the ongroupstandings wrapper
      const jsonStr = text.replace('ongroupstandings(', '').replace(');', '');
      const data = JSON.parse(jsonStr);
      
      if (data && data.points) {
        const tableArray = data.points.map(team => ({
          id: team.TeamID,
          TeamName: team.TeamName,
          TeamCode: team.TeamCode,
          Matches: team.Matches,
          Won: team.Wins,
          Lost: team.Loss,
          Points: team.Points,
          NRR: team.NetRunRate,
          TeamLogo: team.TeamLogo
        }));
        setPointsTable(tableArray);
      } else {
        console.error("Invalid data format received");
        setPointsTable([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching IPL 2025 points table:", error);
      setPointsTable([]);
      setLoading(false);
    }
  };

  const renderTeamRow = ({ item, index }) => (
    <View style={[styles.teamRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <View style={styles.teamInfo}>
        <Text style={styles.position}>{index + 1}</Text>
        <Image 
          source={{ uri: item.TeamLogo || 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/placeholder.png' }} 
          style={styles.teamLogo} 
        />
        <Text style={styles.teamName}>{item.TeamCode}</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>{item.Matches}</Text>
        <Text style={styles.stat}>{item.Won}</Text>
        <Text style={styles.stat}>{item.Lost}</Text>
        <Text style={styles.stat}>{item.Points}</Text>
        <Text style={styles.stat}>{Number(item.NRR).toFixed(1)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

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

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.teamInfo}>
          <Text style={styles.headerText}>Pos</Text>
          <Text style={[styles.headerText, styles.teamHeader]}>Team</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.headerText}>M</Text>
          <Text style={styles.headerText}>W</Text>
          <Text style={styles.headerText}>L</Text>
          <Text style={styles.headerText}>Pts</Text>
          <Text style={styles.headerText}>NRR</Text>
        </View>
      </View>

      <FlatList
        data={pointsTable}
        renderItem={renderTeamRow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
  seasonSelector: {
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    color: "#FFD700",
    backgroundColor: "#2a2a2a",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    marginBottom: 10,
  },
  teamInfo: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
  },
  statsContainer: {
    flex: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
  },
  headerText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
  },
  teamHeader: {
    marginLeft: 40,
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 5,
    borderRadius: 8,
  },
  evenRow: {
    backgroundColor: "#2a2a2a",
  },
  oddRow: {
    backgroundColor: "#333333",
  },
  position: {
    color: "#FFD700",
    fontWeight: "bold",
    width: 25,
    textAlign: "center",
    fontSize: 16,
  },
  teamLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginLeft: 15,
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "bold",
  },
  stat: {
    color: "#fff",
    width: 30,
    textAlign: "center",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default PointsTableScreen;

