import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const teams = [
  { id: 'CSK', name: 'Chennai Super Kings', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/csk.png' },
  { id: 'MI', name: 'Mumbai Indians', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/mi.png' },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/rcb.png' },
  { id: 'KKR', name: 'Kolkata Knight Riders', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/kkr.png' },
  { id: 'RR', name: 'Rajasthan Royals', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/rr.png' },
  { id: 'DC', name: 'Delhi Capitals', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/dc.png' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/srh.png' },
  { id: 'PBKS', name: 'Punjab Kings', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/pbks.png' },
  { id: 'GT', name: 'Gujarat Titans', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/gt.png' },
  { id: 'LSG', name: 'Lucknow Super Giants', logo: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/lsg.png' },
];

const FavoriteTeamsScreen = ({ navigation }) => {
  const { userProfile, updateFavoriteTeams } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState(userProfile?.favoriteTeams || []);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedTeams.length === 0) {
      Alert.alert('Error', 'Please select at least one team');
      return;
    }
    try {
      await updateFavoriteTeams(selectedTeams);
      navigation.navigate('Favorites');
    } catch (error) {
      Alert.alert('Error', 'Failed to save favorite teams');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      <Text style={styles.subtitle}>Choose up to 3 teams to follow</Text>
      
      <ScrollView style={styles.teamsContainer}>
        {teams.map(team => (
          <TouchableOpacity
            key={team.id}
            style={[
              styles.teamCard,
              selectedTeams.includes(team.id) && styles.selectedTeam
            ]}
            onPress={() => {
              if (selectedTeams.includes(team.id) || selectedTeams.length < 3) {
                toggleTeam(team.id);
              } else {
                Alert.alert('Limit Reached', 'You can only select up to 3 teams');
              }
            }}
          >
            <Image source={{ uri: team.logo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{team.name}</Text>
            {selectedTeams.includes(team.id) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Teams</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  teamsContainer: {
    flex: 1,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedTeam: {
    backgroundColor: '#2a2a2a',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  teamName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoriteTeamsScreen; 