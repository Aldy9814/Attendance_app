import { useRef , useState} from 'react';
import { Button, Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {router, useRouter, Href} from 'expo-router';


export default function LandingScreen() {
    
    const router = useRouter();

    return (
        <View style={styles.container}>

          <View style={styles.stepContainer}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Welcome to the Attendance App</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => router.push('/enroll' as Href)}>
                    <Text style={styles.buttonText}>Enroll Face</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => router.push('/attendance' as Href)}>
                    <Text style={styles.buttonText}>Mark Attendance</Text>
                </TouchableOpacity>

            </View>
          </View>
        </View>
    )

}


const styles = StyleSheet.create({
  //PAGE
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 8,
  },

  stepContainer: {
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 5,
    marginBottom: 8,
  },

  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  overlay:{
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },

  titleText: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 15,
  },

  defaultText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 15,
  },

  buttonContainer: {
    width: '100%',
    marginHorizontal: 10,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins_400Regular',
  },

  choiceButton: {
    backgroundColor: '#00529C', // Warna biru korporat/kampus
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5, // Shadow untuk Android
    marginBottom: 20,
  },


});
