import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const { width } = Dimensions.get('window'); // Get screen width
const CARD_WIDTH = width / 3.3; // Adjust card width for better fit
const backgroundImage = { uri: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/bg1.png' };
const titleImage = { uri: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/titletots.png' };

const TOTSScreen = () => {
  const [totsPlayers, setTotsPlayers] = useState([]);
  const [mvpStats, setMvpStats] = useState({});
  const [cardImage, setCardImage] = useState('');

  useEffect(() => {
    const totsRef = ref(database, 'ipl_stats/tots');
    const mvpRef = ref(database, 'ipl_stats/mvp');

    const unsubscribeTots = onValue(totsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTotsPlayers(Object.values(data).filter(item => typeof item === 'object'));
        if (data.Card) setCardImage(data.Card);
      }
    });

    const unsubscribeMVP = onValue(mvpRef, (snapshot) => {
      if (snapshot.exists()) {
        const mvpData = Object.values(snapshot.val()).reduce((acc, player) => {
          acc[player.Name] = player.Points;
          return acc;
        }, {});
        setMvpStats(mvpData);
      }
    });

    return () => {
      unsubscribeTots();
      unsubscribeMVP();
    };
  }, []);

  const sortedPlayers = [...totsPlayers].sort((a, b) => {
    if (a.Wickets !== b.Wickets) {
      return a.Wickets - b.Wickets; // More wickets go to the bottom
    }
    return b.Runs - a.Runs; // More runs stay on top if wickets are the same
  });

  const getLastName = (fullName) => {
    const nameParts = fullName.split(' ');
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
  };

  const renderPlayer = ({ item, index }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <Image source={{ uri: cardImage }} style={styles.cardBackground} />
        <Image source={item.PlayerImage ? { uri: item.PlayerImage } : defaultImage} style={styles.image} />

        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{Math.round(mvpStats[item.Name] || 0)}</Text> 
        </View>

        {item.TeamImage && (
          <Image source={{ uri: item.TeamImage }} style={styles.teamImage} />
        )}

        {index === 0 && <Text style={styles.captainBadge}>C</Text>} 
        {item.Role === 'WK' && <Text style={styles.wkBadge}>WK</Text>}

        <Text style={styles.lastName}>{getLastName(item.Name)}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Image source={titleImage} style={styles.titleImage} />
        <FlatList
          data={sortedPlayers}
          keyExtractor={(item) => item.Name}
          numColumns={3}
          renderItem={renderPlayer}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: { 
    flex: 1, 
    padding: 16, 
    alignItems: 'center',
  },
  titleImage: {
    width: 300, // Adjust width as needed
    height: 50, // Adjust height as needed
    resizeMode: 'contain',
    marginBottom: 10,
  },
  listContainer: { 
    alignItems: 'center',
    paddingBottom: 5,
  },
  cardWrapper: {
    alignItems: 'center',
    marginVertical: 2,
    width: CARD_WIDTH, 
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 180, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative', 
    borderRadius: 12, 
    overflow: 'hidden', 
  },
  cardBackground: {
    width: '100%', 
    height: '100%', 
    position: 'absolute', 
    resizeMode: 'contain', 
    borderRadius: 12, 
    opacity: 0.9,
  },
  image: {
    width: 70, 
    height: 90, 
    position: 'absolute', 
    top: 15,
    left: 40,
  },
  pointsContainer: {
    position: 'absolute',
    top: 38,
    flexDirection: 'row',
    alignItems: 'center',
    left: 24,
  },
  points: {
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#FFD700', 
    marginRight: 6, 
  },
  teamImage: {
    width: 35,  
    height: 30, 
    resizeMode: 'contain',
    position: 'absolute',
    top: 55,
    left: 20,
  },
  lastName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    position: 'absolute',
    bottom: 53,
  },
  captainBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'gold',
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 4,
    borderRadius: 6,
  },
  wkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 4,
    borderRadius: 6,
  },
});

export default TOTSScreen;


