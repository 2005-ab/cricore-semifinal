import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";

const MatchDetailsScreen = () => {
  const route = useRoute();
  const { matchId } = route.params || {};

  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      console.error("❌ No match ID received!");
      setLoading(false);
      return;
    }

    console.log(`📢 Fetching data for matchId: ${matchId}`);
    const db = getDatabase();
    const matchRef = ref(db, `ipl_matches/${matchId}`);

    onValue(
      matchRef,
      (snapshot) => {
        console.log("🔍 Firebase snapshot:", snapshot.val());

        if (snapshot.exists()) {
          console.log("✅ Data found:", snapshot.val());
          setMatchData(snapshot.val());
        } else {
          console.error("⚠️ No data found for matchId:", matchId);
        }
        setLoading(false);
      },
      (error) => {
        console.error("🔥 Firebase error:", error);
        setLoading(false);
      }
    );
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d32f2f" />
        <Text>Loading match details...</Text>
      </View>
    );
  }

  if (!matchData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No match data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={{ uri: matchData.HomeTeamLogo }} style={styles.teamLogo} />
        <Text style={styles.vsText}>VS</Text>
        <Image source={{ uri: matchData.AwayTeamLogo }} style={styles.teamLogo} />
      </View>
      <Text style={styles.matchTitle}>{matchData.HomeTeamName} vs {matchData.AwayTeamName}</Text>
      <Text style={styles.details}>🏟 Stadium: {matchData.GroundName ?? "N/A"}</Text>
      <Text style={styles.details}>📅 Date: {matchData.MatchDate ?? "N/A"}</Text>
      <Text style={styles.toss}>🪙 Toss: {matchData.TossDetails ?? "N/A"}</Text>
      <Text style={styles.result}>🏆 Result: {matchData.Comments ?? matchData.Commentss ?? "N/A"}</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{matchData["1Summary"] ?? "N/A"}</Text>
        <Text style={styles.score}>{matchData["2Summary"] ?? "N/A"}</Text>
      </View>
      
      <View style={styles.momContainer}>
        <Text style={styles.momTitle}>Man of the Match</Text>
        <Image source={{ uri: matchData.MOMImage }} style={styles.momImage} />
        <Text style={styles.momName}>{matchData.MOM}</Text>
        <Text style={styles.momStats}>Runs: {matchData.MOMRuns ?? "0"} | Wickets: {matchData.MOMWicket  ?? "0"}</Text>
      </View>

      <Text style={styles.details}>🧑‍⚖ Umpires: {matchData.GroundUmpire1 ?? "N/A"}, {matchData.GroundUmpire2 ?? "N/A"}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 16, 
    backgroundColor: "#0F172A", 
    alignItems: "center" 
  },
  headerContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 24,
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  teamLogo: { 
    width: 90, 
    height: 90, 
    resizeMode: "contain", 
    marginHorizontal: 20,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#FFFFFF30"
  },
  vsText: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#fff",
    backgroundColor: "#DC2626",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  matchTitle: { 
    fontSize: 26, 
    fontWeight: "800", 
    textAlign: "center", 
    marginVertical: 16,
    color: "#FFFFFF",
    letterSpacing: 0.5
  },
  details: { 
    fontSize: 16, 
    color: "#CBD5E1", 
    marginVertical: 8,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  toss: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#F59E0B", 
    backgroundColor: "#F59E0B20",
    padding: 16,
    borderRadius: 12,
    width: '100%'
  },
  result: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#10B981", 
    backgroundColor: "#10B98120",
    padding: 16,
    borderRadius: 12,
    width: '100%'
  },
  scoreContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    width: "100%", 
    marginVertical: 16,
    gap: 12
  },
  score: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#fff",
    backgroundColor: "#334155",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    textAlign: 'center'
  },
  momContainer: { 
    alignItems: "center", 
    backgroundColor: "#1E293B", 
    padding: 24, 
    borderRadius: 20, 
    marginVertical: 16, 
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  momTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    marginBottom: 12,
    color: "#FFFFFF"
  },
  momImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF30"
  },
  momName: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4
  },
  momStats: { 
    fontSize: 14, 
    color: "#94A3B8",
    letterSpacing: 0.4
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#0F172A"
  },
  errorText: { 
    fontSize: 16, 
    color: "#DC2626", 
    fontWeight: "700" 
  },
});

export default MatchDetailsScreen;