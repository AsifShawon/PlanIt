import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

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

export default function EditPlan({ route, navigation }: any) {
  const { plan } = route.params as { plan: TravelPlan };
  const [editedPlan, setEditedPlan] = useState<TravelPlan>({ ...plan });
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const user = FIREBASE_AUTH.currentUser;

  const handleUpdatePlan = async () => {
    try {
      const db = getFirestore();
      const planRef = doc(db, 'user_plans', user!.uid, 'plans', plan.id);
      
      await updateDoc(planRef, {
        ...editedPlan,
        startDate: new Date(editedPlan.startDate).toISOString(),
        endDate: new Date(editedPlan.endDate).toISOString(),
      });

      Alert.alert('Success', 'Plan updated successfully');
      navigation.replace('MyPlans');
    } catch (error) {
      Alert.alert('Error', 'Failed to update plan');
    }
  };

  const handlePlaceUpdate = (index: number, field: keyof Place, value: string | number) => {
    const updatedPlaces = [...editedPlan.places];
    updatedPlaces[index] = {
      ...updatedPlaces[index],
      [field]: value,
    };
    setEditedPlan({ ...editedPlan, places: updatedPlaces });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, isStartDate: boolean) => {
    if (selectedDate) {
      setEditedPlan({
        ...editedPlan,
        [isStartDate ? 'startDate' : 'endDate']: selectedDate.toISOString(),
      });
    }
    setShowStartDate(false);
    setShowEndDate(false);
  };

  const renderPlaceItem = ({ item, index }: { item: Place; index: number }) => (
    <View style={styles.placeCard}>
      <TextInput
        style={styles.input}
        value={item.name}
        onChangeText={(text) => handlePlaceUpdate(index, 'name', text)}
        placeholder="Place name"
      />
      <TextInput
        style={styles.input}
        value={item.duration}
        onChangeText={(text) => handlePlaceUpdate(index, 'duration', text)}
        placeholder="Duration"
      />
      <TextInput
        style={styles.input}
        value={item.notes}
        onChangeText={(text) => handlePlaceUpdate(index, 'notes', text)}
        placeholder="Notes"
        multiline
      />
      <TextInput
        style={styles.input}
        value={item.expenses_places.toString()}
        onChangeText={(text) => handlePlaceUpdate(index, 'expenses_places', parseFloat(text) || 0)}
        placeholder="Expected expenses"
        keyboardType="numeric"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Plan</Text>
        <TouchableOpacity onPress={handleUpdatePlan}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          style={styles.input}
          value={editedPlan.destination}
          onChangeText={(text) => setEditedPlan({ ...editedPlan, destination: text })}
        />

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity onPress={() => setShowStartDate(true)} style={styles.dateButton}>
          <Text>{new Date(editedPlan.startDate).toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showStartDate && (
          <DateTimePicker
            value={new Date(editedPlan.startDate)}
            mode="date"
            onChange={(event, date) => handleDateChange(event, date, true)}
          />
        )}

        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity onPress={() => setShowEndDate(true)} style={styles.dateButton}>
          <Text>{new Date(editedPlan.endDate).toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showEndDate && (
          <DateTimePicker
            value={new Date(editedPlan.endDate)}
            mode="date"
            onChange={(event, date) => handleDateChange(event, date, false)}
          />
        )}

        <Text style={styles.label}>Vehicle</Text>
        <TextInput
          style={styles.input}
          value={editedPlan.vehicle}
          onChangeText={(text) => setEditedPlan({ ...editedPlan, vehicle: text })}
        />

        <Text style={styles.label}>Expected Expenditure</Text>
        <TextInput
          style={styles.input}
          value={editedPlan.expectedExpenditure.toString()}
          onChangeText={(text) => setEditedPlan({ ...editedPlan, expectedExpenditure: parseFloat(text) || 0 })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Accommodation</Text>
        <TextInput
          style={styles.input}
          value={editedPlan.accommodation}
          onChangeText={(text) => setEditedPlan({ ...editedPlan, accommodation: text })}
        />

        <Text style={styles.label}>Places to Visit</Text>
        <FlatList
          data={editedPlan.places}
          renderItem={renderPlaceItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={editedPlan.additionalNotes}
          onChangeText={(text) => setEditedPlan({ ...editedPlan, additionalNotes: text })}
          multiline
          numberOfLines={4}
        />
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    color: '#C1CB9C',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#E5E6E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  placeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  separator: {
    height: 16,
  },
});