import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>About CRICORE</Text>
      
      {/* Key Features Section */}
      <Text style={styles.sectionTitle}>Key Features</Text>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/cricket.png' }} style={styles.icon} />
        <Text style={styles.text}>Matches: Live updates and match details.</Text>
      </View>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/sports-score.png' }} style={styles.icon} />
        <Text style={styles.text}>Scores: Real-time score tracking.</Text>
      </View>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/trophy.png' }} style={styles.icon} />
        <Text style={styles.text}>Points Table: Updated team rankings.</Text>
      </View>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/bulb.png' }} style={styles.icon} />
        <Text style={styles.text}>Predictor: Predict match outcomes.</Text>
      </View>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/statistics.png' }} style={styles.icon} />
        <Text style={styles.text}>Stats: In-depth player and team stats.</Text>
      </View>
      <View style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/medal.png' }} style={styles.icon} />
        <Text style={styles.text}>TOTS: Team of the Season rankings.</Text>
      </View>
      
      {/* Developer Info */}
      <Text style={styles.sectionTitle}>Developer Info</Text>
      <View style={styles.devContainer}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/user.png' }} style={styles.profileIcon} />
        <View>
          <Text style={styles.text}>Abhimanyu Sood</Text>
          <Text style={styles.text}>Himachal Pradesh</Text>
          <Text style={styles.text}>CS 2nd Year, VIT Chennai</Text>
          <Text style={styles.text}>Cleared SSB Interview (1st Attempt)</Text>
          <Text style={styles.text}>Hobbies: Cricket, Football, Tennis, Running</Text>
          <Text style={styles.text}>Interest: Chess</Text>
        </View>
      </View>
      
      {/* Contact Info */}
      <Text style={styles.sectionTitle}>Contact Info</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/_abhi_sood/')} style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/instagram-new.png' }} style={styles.icon} />
        <Text style={styles.link}>@_abhi_sood</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('https://x.com/_abhi_sood')} style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/twitterx.png' }} style={styles.icon} />
        <Text style={styles.link}>@_abhi_sood</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('https://github.com/2005-ab')} style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/github.png' }} style={styles.icon} />
        <Text style={styles.link}>@2005-ab</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/abhimanyu-sood-3a7aab2b9/')} style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/linkedin.png' }} style={styles.icon} />
        <Text style={styles.link}>Abhimanyu Sood</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:abhi15sood@gmail.com')} style={styles.row}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/gmail.png' }} style={styles.icon} />
        <Text style={styles.link}>abhi15sood@gmail.com</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f9a825',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  link: {
    fontSize: 16,
    color: '#f9a825',
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  devContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});
