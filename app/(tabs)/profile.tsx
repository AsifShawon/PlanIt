import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';  
import { signOut } from 'firebase/auth'; 
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  MyPlans: undefined;
};

interface Plan {
  endDate: string;
}

export default function Profile() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [totalPlans, setTotalPlans] = useState<number>(0);
  const [completedPlans, setCompletedPlans] = useState<number>(0);

  const fetchPlanCounts = async (userId: string) => {
    try {
      const plansRef = collection(FIREBASE_DB, 'user_plans', userId, 'plans');
      const querySnapshot = await getDocs(plansRef);
      
      const plans = querySnapshot.docs.map(doc => doc.data() as Plan);
      const total = plans.length;
      
      const currentDate = new Date();
      const completed = plans.filter(plan => {
        const endDate = new Date(plan.endDate);
        return endDate < currentDate;
      }).length;
      
      setTotalPlans(total);
      setCompletedPlans(completed);
    } catch (error) {
      console.error('Error fetching plan counts:', error);
    }
  };

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
          await fetchPlanCounts(user.uid);
        } catch (error) {
          console.error('Error fetching user data from Firestore: ', error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setTotalPlans(0);
        setCompletedPlans(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      console.log('User logged out successfully!');
      navigation.replace('Login');
    } catch (error: any) {
      console.error('Error signing out: ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5733" />
        </TouchableOpacity>
      </View>

      {user && userData ? (
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image 
                style={styles.avatar}
                source={user.photoURL ? { uri: user.photoURL } : require('../../assets/user.png')}
                contentFit="cover"
                transition={1000}
              />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.name}>
                {`${userData.firstName || 'First Name'} ${userData.lastName || 'Last Name'}`}
              </Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={24} color="#3A4646" />
              <Text style={styles.statNumber}>{totalPlans}</Text>
              <Text style={styles.statLabel}>Plans</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#3A4646" />
              <Text style={styles.statNumber}>{completedPlans}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.replace('MyPlans')}
          >
            <Ionicons name="list-outline" size={24} color="#ffffff" />
            <Text style={styles.menuButtonText}>My Plans</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="reload-outline" size={40} color="#3A4646" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#C1CB9C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#C1CB9C',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3A4646',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3A4646',
    overflow: 'hidden',
    marginBottom: 15,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A4646',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4646',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  menuButton: {
    backgroundColor: '#3A4646',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
});