import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';

// Import Screens
import AboutScreen from './screens/AboutScreen';
import MatchesScreen from './screens/MatchesScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import PredictorScreen from './screens/PredictorScreen';
import StatsScreen from './screens/StatsScreen';
import StatsScreen2025 from './screens/StatsScreen2025';
import TOTSScreen from './screens/TOTSScreen';
import MatchDetailsScreen from './screens/MatchDetailsScreen';
import AuthScreen from './screens/AuthScreen';
import FavoriteTeamsScreen from './screens/FavoriteTeamsScreen';
import FavoritesScreen from './screens/FavoritesScreen';

// Import Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create a context for the selected season
export const SeasonContext = React.createContext();

const getCurrentDate = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  return new Date().toLocaleDateString('en-US', options);
};

const CustomHeader = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigation = useNavigation();

  const handleProfilePress = () => {
    if (currentUser) {
      navigation.navigate('FavoriteTeams');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowAuthModal(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/cricore_logo.png' }}
              style={styles.logo}
            />
            <Text style={styles.title}>CRICORE</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={handleProfilePress}
          >
            {currentUser ? (
              <>
                <Text style={styles.userName}>{userProfile?.username || 'User'}</Text>
                <Ionicons name="person-circle-outline" size={24} color="#FFD700" />
              </>
            ) : (
              <>
                <Text style={styles.loginText}>Login</Text>
                <Ionicons name="person-circle-outline" size={24} color="#FFD700" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAuthModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <AuthScreen />
          </View>
        </View>
      </Modal>
    </>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const BottomTabs = () => {
  const { selectedSeason } = React.useContext(SeasonContext);
  const { currentUser } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Matches':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Points Table':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'TOTS':
              iconName = focused ? 'people' : 'people-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#121212',
        },
      })}
    >
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Tab.Screen 
        name="Points Table" 
        component={PointsTableScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      {currentUser && (
        <Tab.Screen 
          name="Favorites" 
          component={FavoritesScreen}
          options={{
            header: () => <CustomHeader />,
          }}
        />
      )}
      <Tab.Screen 
        name="Stats" 
        component={selectedSeason === "2024" ? StatsScreen : StatsScreen2025}
        options={{
          header: () => <CustomHeader />,
        }}
      />
      <Tab.Screen 
        name="TOTS" 
        component={TOTSScreen}
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Tab.Navigator>
  );
};

function AppContent() {
  const [selectedSeason, setSelectedSeason] = useState("2025");
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SeasonContext.Provider value={{ selectedSeason, setSelectedSeason }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {currentUser ? (
            <>
              <Stack.Screen name="Main" component={BottomTabs} />
              <Stack.Screen name="MatchDetailsScreen" component={MatchDetailsScreen} />
              <Stack.Screen name="FavoriteTeams" component={FavoriteTeamsScreen} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SeasonContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  // Header styles
  headerWrapper: { paddingTop: 15, backgroundColor: '#1e1e1e' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#1e1e1e' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, resizeMode: 'contain' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  userName: { color: '#FFD700', fontSize: 16, marginRight: 8 },
  loginText: { color: '#FFD700', fontSize: 16, marginRight: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#121212',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});

