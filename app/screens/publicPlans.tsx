import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
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
  setDoc,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

const AllPublicPlansScreen = ({ navigation }: any) => {
  const [publicPlans, setPublicPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
        limit(20)
      );
  
      if (loadMore && lastVisible) {
        publicPlansQuery = query(
          collectionGroup(db, 'plans'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc'),
          orderBy('__name__'),
          limit(20)
        );
      }
  
      const querySnapshot = await getDocs(publicPlansQuery);
  
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
        setHasMore(querySnapshot.docs.length === 20);
      } else {
        setHasMore(false);
      }
  
      setError(null);
    } catch (err) {
      console.error('Error fetching public plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch public plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setLastVisible(null);
    setHasMore(true);
    fetchPublicPlans();
  };

  const handleSavePlan = async (plan: TravelPlan) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please login to save plans');
      return;
    }

    try {
      const db = getFirestore();
      const savedPlansRef = collection(db, `user_plans/${currentUser.uid}/plans`);

      const existingQuery = query(savedPlansRef, where('originalPlanId', '==', plan.id));
      const existingDocs = await getDocs(existingQuery);

      // console.log('Existing docs:', existingDocs.docs, plan.id);

      if (existingDocs.docs.length > 0) {
        Alert.alert('Info', 'Plan already exists to your list');
        return;
      }

      const newPlanRef = doc(savedPlansRef);
      console.log('New plan ref id:', newPlanRef.id);
      
      const savedPlan = {
        ...plan,
        id: newPlanRef.id,
        originalPlanId: plan.id,
        userId: currentUser.uid,
        savedAt: serverTimestamp(),
        isEdited: false,
        visibility: 'private'
      };

      await setDoc(newPlanRef, savedPlan);
      Alert.alert('Success', 'Plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    }
  };

  const renderPlanCard = ({ item: plan }: { item: TravelPlan }) => {
    const isOwnPlan = currentUser && plan.userId === currentUser.uid;

    return (
      <TouchableOpacity
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

  useEffect(() => {
    fetchPublicPlans();
  }, []);

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
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.top_text}>Publice Plans</Text>
        <View style={styles.emptySpace} />
      </View>
      <FlatList
        data={publicPlans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => fetchPublicPlans(true)}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No public plans available</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreatePlan')}
            >
              <Text style={styles.createButtonText}>Create New Plan</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={() => (
          loading && publicPlans.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} color="#0000ff" />
          ) : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C1CB9C',
    paddingTop: 50,
  },
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
  listContainer: {
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  footerLoader: {
    paddingVertical: 20,
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
    flex: 1,
  },
  visibilityTag: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  visibilityText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
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
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
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
});

export default AllPublicPlansScreen;