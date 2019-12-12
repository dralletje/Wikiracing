import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { App as MainApp } from './src/App.js';

export default function App() {
  return (
    <MainApp />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
