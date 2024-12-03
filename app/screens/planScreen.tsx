import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

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

  React.useEffect(() => {
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
      <Ionicons name="time-outline" size={20} color="#666" />
      <Text style={styles.countdownText}>{timeLeft}</Text>
    </View>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export default function PlanDetails({ route, navigation }: any) {
  const { plan } = route.params as { plan: TravelPlan };
  const user = FIREBASE_AUTH.currentUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      const tripDuration = Math.ceil(
        (new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const shareMessage = `
🌎 Trip to ${plan.destination}
📅 ${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}
⏱ Duration: ${tripDuration} days
🚗 Transport: ${plan.vehicle}
💰 Budget: $${plan.expectedExpenditure}
🏨 Accommodation: ${plan.accommodation}

📍 Places to visit:
${plan.places.map((place) => `- ${place.name} (${place.duration})`).join('\n')}

📝 Notes: ${plan.additionalNotes}
      `.trim();

      await Share.share({
        message: shareMessage,
        title: `Travel Plan: ${plan.destination}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share plan');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this travel plan?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              await deleteDoc(doc(db, 'user_plans', user!.uid, 'plans', plan.id));
              navigation.replace("MyPlans");
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plan');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderPlaceItem = ({ item }: { item: Place }) => (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeDuration}>{item.duration}</Text>
      </View>
      {item.notes && <Text style={styles.placeNotes}>{item.notes}</Text>}
      <View style={styles.placeExpense}>
        <Ionicons name="cash-outline" size={16} color="#666" />
        <Text style={styles.expenseText}>${item.expenses_places}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.replace('MyPlans')}>
          <Ionicons name="arrow-back" size={24} style={styles.backArrow} color="black" />
        </TouchableOpacity>
        <Text style={styles.destination}>{plan.destination}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} style={styles.backArrow} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditPlan', { plan })}
            style={styles.iconButton}
          >
            <Ionicons name="create-outline" size={24} style={styles.backArrow} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <CountdownTimer startDate={plan.startDate} />

      <Section title="Trip Details">
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={20} color="#666" />
          <Text style={styles.detailText}>{plan.vehicle}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={20} color="#666" />
          <Text style={styles.detailText}>${plan.expectedExpenditure}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={20} color="#666" />
          <Text style={styles.detailText}>{plan.accommodation}</Text>
        </View>
      </Section>

      <Section title="Places to Visit">
        <FlatList
          data={plan.places}
          renderItem={renderPlaceItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Section>

      {plan.additionalNotes && (
        <Section title="Additional Notes">
          <Text style={styles.notesText}>{plan.additionalNotes}</Text>
        </Section>
      )}

      {plan.visibility === 'invited' && plan.invitedEmails.length > 0 && (
        <Section title="Shared With">
          {plan.invitedEmails.map((email, index) => (
            <View key={index} style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{email}</Text>
            </View>
          ))}
        </Section>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#C1CB9C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3A4646',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backArrow:{
    color:'#C1CB9C',
  },
  destination: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  countdownText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  placeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  placeDuration: {
    fontSize: 14,
    color: '#666',
  },
  placeNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeExpense: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});