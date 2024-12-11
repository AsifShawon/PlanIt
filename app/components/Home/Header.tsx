import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig'
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        setUser(user); 
        try {
          const userRef = doc(FIREBASE_DB, 'users', user.uid); 
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data()); 
          } else {
            console.log('No user data found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore: ', error);
        }
      } else {
        setUser(null);
        setUserData(null); 
      }
    });

    return () => unsubscribe();
  }, [user, userData]);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Image 
          style={styles.profileImage} 
          source={userData?.profilePicture 
            ? { uri: userData.profilePicture } 
            : require('../../../assets/user.png')} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome to <Text style={{fontWeight:'bold', color:'#3A4646'}}>Planit</Text></Text>
          <Text style={styles.fullname}>
            {userData?.firstName} {userData?.lastName}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    paddingTop: 55,
    paddingHorizontal: 20,
    backgroundColor: '#C1CB9C'
  },
  headerCard: {
    color: '#3A4646',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E6E1',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15
  },
  userInfo: {
    flex: 1,
    justifyContent: 'space-between'
  },
  greeting: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5
  },
  fullname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  }
})