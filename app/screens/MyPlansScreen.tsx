import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getFirestore, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

interface Place {
  name: string;
  duration: string;
  notes: string;
  expenses_places: number;
}

interface TravelPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  vehicle: string;
  expectedExpenditure: number;
  places: Place[];
  accommodation: string;
  additionalNotes: string;
  visibility: 'private' | 'public' | 'invited';
  invitedEmails: string[];
  createdAt: string;
}

const CountdownTimer = ({ startDate }: { startDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const tripDate = new Date(startDate).getTime();
      const distance = tripDate - now;

      if (distance < 0) {
        setTimeLeft('Trip has started!');
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <View style={styles.countdownContainer}>
      <Ionicons name="time-outline" size={16} color="#666" />
      <Text style={styles.countdownText}>{timeLeft}</Text>
    </View>
  );
};

export default function MyPlans({ navigation }: any) {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [totalExpenditure, setTotalExpenditure] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setUser(user);
        fetchPlans(user.uid);
      } else {
        navigation.replace('Login');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPlans = async (userId: string) => {
    try {
      const db = getFirestore();
      const plansRef = collection(db, 'user_plans', userId, 'plans');
      const q = query(plansRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetchedPlans: TravelPlan[] = [];
      let total = 0;

      querySnapshot.forEach((doc) => {
        const plan = { id: doc.id, ...doc.data() } as TravelPlan;
        fetchedPlans.push(plan);
        total += plan.expectedExpenditure;
      });

      setPlans(fetchedPlans);
      setTotalExpenditure(total);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch plans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderPlanCard = ({ item }: { item: TravelPlan }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.replace('Plan', { plan: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.destination}>{item.destination}</Text>
        <View style={styles.visibilityTag}>
          <Text style={styles.visibilityText}>{item.visibility}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.dateText}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>

      <CountdownTimer startDate={item.startDate} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="car-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.vehicle}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.infoText}>৳{item.expectedExpenditure}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.places.length} places</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.top_text}>My Plans</Text>
        <View style={styles.emptySpace} />
      </View>
      <View style={styles.expenditureSummary}>
        <Text style={styles.expenditureTitle}>Total Expected Expenditure</Text>
        <Text style={styles.expenditureAmount}>৳{totalExpenditure.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.replace('Tabs', { screen: 'CreatePlan' })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Create New Plan</Text>
      </TouchableOpacity>

      {plans.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noPlansText}>No travel plans yet</Text>
          <Text style={styles.subText}>Create your first travel plan!</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  top_text: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A4646',
  },
  emptySpace: {
    width: 24,
  },
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#C1CB9C',
    padding: 16,
  },
  expenditureSummary: {
    backgroundColor: '#566b5b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  expenditureTitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  expenditureAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#276e52',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  destination: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  visibilityTag: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  visibilityText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  noPlansText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
});