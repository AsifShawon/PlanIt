import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig.ts';  // Import Firestore
import { signOut } from 'firebase/auth'; 
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  MyPlans: undefined;
};

export default function Profie() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();
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
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH); 
      console.log('User logged out successfully!');
      navigation.replace('Login'); 
    } catch (error:any) {
      console.error('Error signing out: ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Profile Card */}
      {user && userData ? (
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              style={styles.avatar}
              source={user.photoURL ? { uri: user.photoURL } : require('../../assets/user.png')} 
            />
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{`${userData.firstName || 'First Name'} ${userData.lastName || 'Last Name'}`}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading user information...</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={()=>navigation.replace('MyPlans')}>
        <Text style={styles.logoutText}>My Plans</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 50,
    width: 100,
    height: 100,
    overflow: 'hidden',
    marginBottom: 15,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
