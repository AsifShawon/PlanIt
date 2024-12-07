import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getFirestore, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const CARD_WIDTH = Dimensions.get('window').width * 0.85;

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

export default function PlansSlider({ navigation }: any) {
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      fetchRecentPlans(user.uid);
    }
  }, []);

  const fetchRecentPlans = async (userId: string) => {
    try {
      const db = getFirestore();
      const plansRef = collection(db, 'user_plans', userId, 'plans');
      const q = query(plansRef, orderBy('createdAt', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);

      const fetchedPlans: TravelPlan[] = [];
      querySnapshot.forEach((doc) => {
        const plan = { id: doc.id, ...doc.data() } as TravelPlan;
        fetchedPlans.push(plan);
      });

      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Error fetching recent plans:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Travel Plans</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MyPlans')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {plans.length === 0 ? (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>No travel plans yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreatePlan')}
            >
              <Text style={styles.createButtonText}>Create New Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.card}
              onPress={() => navigation.navigate('Plan', { plan })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.destination}>{plan.destination}</Text>
                <View style={styles.visibilityTag}>
                  <Text style={styles.visibilityText}>{plan.visibility}</Text>
                </View>
              </View>

              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>
                  {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="car-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{plan.vehicle}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>৳{plan.expectedExpenditure}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A4646',
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllText: {
    color: '#276e52',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#276e52',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
});