import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getFirestore, 
  collectionGroup,
  collection,
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit,
  DocumentSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CARD_WIDTH = Dimensions.get('window').width * 0.85;

interface Place {
  name: string;
  duration: string;
  notes: string;
  expenses_places: number;
}

interface TravelPlan {
  id?: string;
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
  userId: string;
}

const PublicPlansSection = ({ navigation }: any) => {
  const [publicPlans, setPublicPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  const fetchPublicPlans = async (loadMore = false) => {
    if (!hasMore && loadMore) return;
    
    try {
      setLoading(true);
      const db = getFirestore();
      
      let publicPlansQuery = query(
        collectionGroup(db, 'plans'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        orderBy('__name__'),
        limit(10)
      );
  
      if (loadMore && lastVisible) {
        publicPlansQuery = query(
          collectionGroup(db, 'plans'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          orderBy('__name__'),
          limit(10)
        );
      }
  
      const querySnapshot = await getDocs(publicPlansQuery).catch(err => {
        if (err.code === 'failed-precondition' || err.message.includes('requires an index')) {
          throw new Error(
            'Database indexes not yet ready. Please wait a few minutes and try again, or contact support if the issue persists.'
          );
        }
        throw err;
      });
  
      const fetchedPlans: TravelPlan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TravelPlan;
        fetchedPlans.push({
          ...data,
          id: doc.id,
        });
      });
  
      setPublicPlans(prev => 
        loadMore ? [...prev, ...fetchedPlans] : fetchedPlans
      );
  
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 10);
      } else {
        setHasMore(false);
      }
  
      setError(null);
    } catch (err) {
      console.error('Error fetching public plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch public plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (plan: TravelPlan) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please login to save plans');
      return;
    }

    try {
      const db = getFirestore();
      const savedPlansRef = collection(db, `users/${currentUser.uid}/savedPlans`);
      
      // Check if already saved
      const existingQuery = query(savedPlansRef, where('originalPlanId', '==', plan.id));
      const existingDocs = await getDocs(existingQuery);
      
      if (!existingDocs.empty) {
        Alert.alert('Info', 'Plan already saved to your list');
        return;
      }

      const savedPlan = {
        ...plan,
        originalPlanId: plan.id,
        originalUserId: plan.userId,
        savedAt: serverTimestamp(),
        isEdited: false,
        visibility: 'private' 
      };
      delete savedPlan.id; 

      await addDoc(savedPlansRef, savedPlan);
      Alert.alert('Success', 'Plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    }
  };

  const renderPlanCard = (plan: TravelPlan) => {
    const isOwnPlan = currentUser && plan.userId === currentUser.uid;

    return (
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
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
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

        {!isOwnPlan && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => handleSavePlan(plan)}
            >
              <Ionicons name="bookmark-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && publicPlans.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading public plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Explore Public Plans</Text>
        <TouchableOpacity onPress={() => navigation.navigate('publicplans')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {publicPlans.length === 0 ? (
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
          publicPlans.map((plan) => renderPlanCard(plan))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A4646',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#276e52',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PublicPlansSection;