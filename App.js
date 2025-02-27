import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

// Import Screens
import AboutScreen from './screens/AboutScreen';
import MatchesScreen from './screens/MatchesScreen';
import PointsTableScreen from './screens/PointsTableScreen';
import PredictorScreen from './screens/PredictorScreen';
import StatsScreen from './screens/StatsScreen';
import TOTSScreen from './screens/TOTSScreen';
import MatchDetailsScreen from './screens/MatchDetailsScreen';

const getCurrentDate = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  return new Date().toLocaleDateString('en-US', options);
};

const CustomHeader = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/cricore_logo.png' }}
            style={styles.logo}
          />
          <Text style={styles.title}>CRICORE</Text>
        </View>
        <Text style={styles.dateText}>{`Today: ${currentDate}`}</Text>
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <>
      <CustomHeader />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1e1e1e' },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Matches') {
              iconName = 'calendar-outline';
            } else if (route.name === 'Points Table') {
              iconName = 'bar-chart-outline';
            } else if (route.name === 'Predictor') {
              iconName = 'bulb-outline';
            } else if (route.name === 'Stats') {
              iconName = 'stats-chart-outline';
            } else if (route.name === 'TOTS') {
              iconName = 'people-outline';
            } else if (route.name === 'About') {
              iconName = 'information-circle-outline';
            }
            return <Ionicons name={iconName} size={size} color={focused ? '#FFD700' : 'gray'} style={focused ? styles.glowEffect : null} />;
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Matches" component={MatchesScreen} />
        <Tab.Screen name="Points Table" component={PointsTableScreen} />
        <Tab.Screen name="Predictor" component={PredictorScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="TOTS" component={TOTSScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
    </>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="MatchDetailsScreen" component={MatchDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Header styles
  headerWrapper: { paddingTop: 15, backgroundColor: '#1e1e1e' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#1e1e1e' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, resizeMode: 'contain' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  dateText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
