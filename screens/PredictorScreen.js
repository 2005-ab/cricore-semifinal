import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const teams = ["RCB", "CSK", "SRH", "MI", "PBKS", "DC", "GT", "LSG", "RR", "KKR"];
const stadiums = [
  "Chinnaswamy", "Chepauk", "Rajiv Gandhi Stadium", "Wankhede", "Mohali Stadium",
  "Firoz Shah Kotla", "Motera Stadium", "Ekaana Stadium", "Sawai Mansingh Stadium", "Eden Gardens"
];

const teamData = {
  RCB: { batting: 6, bowling: 8, againstSpin: 7, againstPace: 8, spinAttack: 3, paceAttack: 9, home: "Chinnaswamy", pitch: "Both" },
  CSK: { batting: 4, bowling: 6, againstSpin: 5, againstPace: 7, spinAttack: 10, paceAttack: 6, home: "Chepauk", pitch: "Spin" },
  SRH: { batting: 10, bowling: 3, againstSpin: 6, againstPace: 9, spinAttack: 2, paceAttack: 8, home: "Rajiv Gandhi Stadium", pitch: "Spin" },
  MI: { batting: 8, bowling: 9, againstSpin: 10, againstPace: 3, spinAttack: 4, paceAttack: 10, home: "Wankhede", pitch: "Spin" },
  PBKS: { batting: 3, bowling: 5, againstSpin: 3, againstPace: 5, spinAttack: 6, paceAttack: 5, home: "Mohali Stadium", pitch: "Pace" },
  DC: { batting: 9, bowling: 7, againstSpin: 1, againstPace: 10, spinAttack: 8, paceAttack: 4, home: "Firoz Shah Kotla", pitch: "Spin" },
  GT: { batting: 1, bowling: 10, againstSpin: 4, againstPace: 6, spinAttack: 7, paceAttack: 7, home: "Motera Stadium", pitch: "Spin" },
  LSG: { batting: 2, bowling: 1, againstSpin: 8, againstPace: 1, spinAttack: 1, paceAttack: 3, home: "Ekaana Stadium", pitch: "Pace" },
  RR: { batting: 7, bowling: 2, againstSpin: 9, againstPace: 2, spinAttack: 5, paceAttack: 1, home: "Sawai Mansingh Stadium", pitch: "Both" },
  KKR: { batting: 5, bowling: 4, againstSpin: 2, againstPace: 4, spinAttack: 9, paceAttack: 2, home: "Eden Gardens", pitch: "Spin" }
};

const PredictorScreen = () => {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [stadium, setStadium] = useState("");
  const [result, setResult] = useState(null);
  const [homeAdvantage, setHomeAdvantage] = useState(false);

  const predictWinner = () => {
    if (!teamA || !teamB || !stadium) {
      Alert.alert("Error", "Please select both teams and a stadium.");
      return;
    }

    const teamAStats = teamData[teamA];
    const teamBStats = teamData[teamB];
    const stadiumPitch = Object.values(teamData).find(team => team.home === stadium)?.pitch;

    let teamAScore = teamAStats.batting + teamAStats.bowling;
    let teamBScore = teamBStats.batting + teamBStats.bowling;

    const homeTeam = Object.keys(teamData).find(team => teamData[team].home === stadium);
    setHomeAdvantage(homeTeam === teamA || homeTeam === teamB);
    if (homeTeam === teamA) teamAScore *= 1.2;
    if (homeTeam === teamB) teamBScore *= 1.2;

    if (stadiumPitch === "Spin") {
      teamAScore += teamAStats.spinAttack;
      teamBScore += teamBStats.spinAttack;
    } else if (stadiumPitch === "Pace") {
      teamAScore += teamAStats.paceAttack;
      teamBScore += teamBStats.paceAttack;
    }

    const winner = teamAScore > teamBScore ? teamA : teamB;
    setResult(winner);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>🏏 Cricket Match Predictor</Text>
      </View>

      <View style={styles.boxContainer}>
        <Picker selectedValue={teamA} onValueChange={setTeamA} style={styles.picker}>
          <Picker.Item label="Select Team A" value="" />
          {teams.map(team => <Picker.Item key={team} label={team} value={team} />)}
        </Picker>
        <Picker selectedValue={teamB} onValueChange={setTeamB} style={styles.picker}>
          <Picker.Item label="Select Team B" value="" />
          {teams.map(team => <Picker.Item key={team} label={team} value={team} />)}
        </Picker>
        <Picker selectedValue={stadium} onValueChange={setStadium} style={styles.picker}>
          <Picker.Item label="Select Stadium" value="" />
          {stadiums.map(stadium => <Picker.Item key={stadium} label={stadium} value={stadium} />)}
        </Picker>
      </View>

      <TouchableOpacity onPress={predictWinner} style={styles.button}>
        <Text style={styles.buttonText}>🎯 Predict Winner</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>🏆 Winner: {result}</Text>
          {homeAdvantage && <Text style={styles.advantage}>🏠 Home Advantage Activated!</Text>}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1e1e1e', padding: 20, alignItems: 'center', justifyContent: 'center' },
  headerContainer: { backgroundColor: '#FFD700', padding: 15, borderRadius: 10, marginBottom: 20, width: '100%', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e1e1e' },
  boxContainer: { backgroundColor: '#333', padding: 15, borderRadius: 10, marginBottom: 15, width: '90%' },
  picker: { width: '100%', height: 50, color: 'white', backgroundColor: '#222', marginBottom: 10 },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 10, alignItems: 'center', width: '90%' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#1e1e1e' },
  resultContainer: { backgroundColor: '#333', padding: 15, borderRadius: 10, marginTop: 15, width: '90%' },
  result: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', textAlign: 'center' },
  advantage: { fontSize: 14, color: 'white', textAlign: 'center', marginTop: 5 }
});

export default PredictorScreen;
