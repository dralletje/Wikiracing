import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as firebase from "firebase";

import { App as MainApp } from './src/App.js';

let app = firebase.initializeApp({
  apiKey: "AIzaSyBSLGxWu0rKt5Qglirqd95yAZE2PYY1CHU",
  authDomain: "wikiracing-93971.firebaseapp.com",
  databaseURL: "https://wikiracing-93971.firebaseio.com",
  projectId: "wikiracing-93971",
  storageBucket: "",
  messagingSenderId: "66848635721",
  appId: "1:66848635721:web:cb57721673d66bf2"
});

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#eee" }}>
      <React.Suspense fallback={<View />}>
        <MainApp app={app} />
      </React.Suspense>
    </View>
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
