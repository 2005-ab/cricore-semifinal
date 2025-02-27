import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebase';

const WelcomeScreen = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const db = getFirestore(app);
  const auth = getAuth();
  
  useEffect(() => {
    // Check if the user already entered their name
    const checkName = async () => {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        navigation.replace('Main');
      }
    };
    checkName();
  }, []);

  const handleSaveName = async () => {
    if (name.trim() === '') return;
    
    await AsyncStorage.setItem('userName', name);
    
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { name }, { merge: true });
    }
    
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://raw.githubusercontent.com/2005-ab/TOTS-Images/refs/heads/main/cricore_logo.png' }} style={styles.logo} />
      <Text style={styles.title}>Welcome to CRICORE</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="gray"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveName}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
