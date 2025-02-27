// components/ui/Select.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Select = ({ label, items, selectedValue, onValueChange }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Select an option..." value="" />
          {items.map(item => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 8,
  },
  label: {
    color: '#9400ff',
    fontSize: 16,
    marginBottom: 4,
  },
  pickerContainer: {
    borderColor: '#9400ff',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  picker: {
    color: '#fff',
  },
});

export default Select;
