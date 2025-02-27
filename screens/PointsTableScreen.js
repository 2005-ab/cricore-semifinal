import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";

const PointsTableScreen = () => {
  const [pointsTable, setPointsTable] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const pointsRef = ref(db, "ipl_stats/points_table");

    onValue(pointsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teamsArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        teamsArray.sort((a, b) => a.Rank - b.Rank); // Sort by rank
        setPointsTable(teamsArray);
      }
    });
  }, []);

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamRow}>
      <View style={styles.cell}><Text style={styles.rank}>{item.Rank}</Text></View>
      <View style={[styles.cell, styles.teamContainer]}>
        <Image source={{ uri: item.TeamLogo }} style={styles.teamLogo} />
        <Text style={styles.teamName}>{item.Team}</Text>
      </View>
      <View style={[styles.cell, styles.shiftRight]}><Text style={styles.matches}>{item.Matches}</Text></View>
      <View style={styles.cell}><Text style={styles.wins}>{item.Wins}</Text></View>
      <View style={styles.cell}><Text style={styles.losses}>{item.Losses}</Text></View>
      <View style={styles.cell}><Text style={styles.points}>{item.Points}</Text></View>
      <View style={styles.cell}><Text style={styles.nrr}>{item.NRR}</Text></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>IPL Points Table</Text>
      <View style={styles.tableHeader}>
        <View style={styles.cell}><Text style={styles.rank}>#</Text></View>
        <View style={[styles.cell, styles.teamHeader]}><Text style={styles.teamText}>Team</Text></View>
        <View style={[styles.cell, styles.shiftRight]}><Text style={styles.matches}>M</Text></View>
        <View style={styles.cell}><Text style={styles.wins}>W</Text></View>
        <View style={styles.cell}><Text style={styles.losses}>L</Text></View>
        <View style={styles.cell}><Text style={styles.points}>P</Text></View>
        <View style={styles.cell}><Text style={styles.nrr}>NRR</Text></View>
      </View>
      <FlatList
        data={pointsTable}
        keyExtractor={(item) => item.id}
        renderItem={renderTeamItem}
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
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rank: {
    color: "#fff",
    textAlign: "center",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 3,
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    backgroundColor: "transparent",
  },
  teamName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "left",
    marginLeft: 5,
  },
  matches: {
    color: "#fff",
    textAlign: "center",
  },
  wins: {
    color: "#4CAF50",
    textAlign: "center",
  },
  losses: {
    color: "#F44336",
    textAlign: "center",
  },
  points: {
    color: "#FFD700",
    textAlign: "center",
  },
  nrr: {
    color: "#fff",
    textAlign: "center",
  },
  teamHeader: {
    flex: 3,
  },
  teamText: {
    color: "#fff",
    textAlign: "center",
  },
  shiftRight: {
    marginLeft: 10,
  }
});

export default PointsTableScreen;
