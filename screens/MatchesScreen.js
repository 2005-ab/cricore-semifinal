import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const matchesRef = ref(db, "ipl_matches");

    onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const matchesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Reverse list so latest match (74) appears first
        setMatches(matchesArray.reverse());
      }
    });
  }, []);

  // Function to display special match labels
  const getMatchLabel = (rowNo) => {
    if (rowNo === 74) return "Final";
    if (rowNo === 73) return "Qualifier 2";
    if (rowNo === 72) return "Eliminator";
    if (rowNo === 71) return "Qualifier 1";
    return `Match No: ${rowNo}`; // Default match number
  };

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.matchContainer}
      onPress={() => navigation.navigate("MatchDetailsScreen", { matchId: item.MatchID })}
    >
      {/* Top Bar with IPL 2024 and Match No / Special Label */}
      <View style={styles.topBar}>
        <Text style={styles.iplText}>IPL 2024</Text>
        <Text style={styles.matchNo}>{getMatchLabel(item.RowNo)}</Text>
      </View>

      <View style={styles.matchRow}>
        <View style={styles.teamContainerLeft}>
          <Image source={{ uri: item.HomeTeamLogo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{item.HomeTeamName}</Text>
        </View>

        <Text style={styles.vsText}>v/s</Text>

        <View style={styles.teamContainerRight}>
          <Image source={{ uri: item.AwayTeamLogo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{item.AwayTeamName}</Text>
        </View>
      </View>

      <Text style={styles.details}>{item.GroundName}</Text>
      <Text style={styles.details}>{item.Comments || item.Commentss}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList data={matches} keyExtractor={(item) => item.id} renderItem={renderMatchItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 10,
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
