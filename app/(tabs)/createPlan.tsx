import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, collection, addDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Place {
  name: string;
  duration: string;
  notes: string;
  expenses_places: number;
}

interface TravelPlan {
  destination: string;
  startDate: Date;
  endDate: Date;
  vehicle: string;
  expectedExpenditure: number;
  places: Place[];
  accommodation: string;
  additionalNotes: string;
  visibility: 'private' | 'public' | 'invited';
  invitedEmails: string[];
}

export default function CreatePlan({ navigation }: any) {

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [plan, setPlan] = useState<TravelPlan>({
    destination: '',
    startDate: new Date(),
    endDate: new Date(),
    vehicle: 'Car',
    expectedExpenditure: 0,
    places: [],
    accommodation: '',
    additionalNotes: '',
    visibility: 'private',
    invitedEmails: [],
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [newPlace, setNewPlace] = useState<Place>({
    name: '',
    duration: '',
    notes: '',
    expenses_places: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigation.replace('Login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDateChange = (event: any, selectedDate: Date | undefined, dateType: 'start' | 'end') => {
    if (selectedDate) {
      setPlan((prev) => ({
        ...prev,
        [dateType === 'start' ? 'startDate' : 'endDate']: selectedDate,
      }));
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const addPlace = () => {
    if (!newPlace.name || !newPlace.duration) {
      Alert.alert('Error', 'Please fill in at least the place name and duration');
      return;
    }

    setPlan((prev) => ({
      ...prev,
      places: [...prev.places, newPlace],
    }));

    setNewPlace({
      name: '',
      duration: '',
      notes: '',
      expenses_places: 0,
    });
  };

  const removePlace = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      places: prev.places.filter((_, i) => i !== index),
    }));
  };

  const savePlan = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to save your plan');
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const userPlansRef = collection(db, 'user_plans', user.uid, 'plans');

      await addDoc(userPlansRef, {
        ...plan,
        createdAt: new Date(),
        startDate: plan.startDate.toISOString(),
        endDate: plan.endDate.toISOString(),
      });

      Alert.alert('Success', 'Your travel plan has been saved!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyPlans'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={plan.destination}
        onChangeText={(text) => setPlan((prev) => ({ ...prev, destination: text }))}
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartDatePicker(true)}
      >
        <Text>Start Date: {plan.startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Text>End Date: {plan.endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showStartDatePicker && (
        <DateTimePicker
          value={plan.startDate}
          mode="date"
          onChange={(event: any, date) => handleDateChange(event, date, 'start')}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={plan.endDate}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, 'end')}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Transportation</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={plan.vehicle}
          onValueChange={(value) => setPlan((prev) => ({ ...prev, vehicle: value }))}
          style={styles.picker}
        >
          <Picker.Item label="Car" value="Car" />
          <Picker.Item label="Train" value="Train" />
          <Picker.Item label="Bus" value="Bus" />
          <Picker.Item label="Flight" value="Flight" />
        </Picker>
      </View>

      <Text style={styles.inputLabel}>Expected Expenditure</Text>
      <TextInput
        style={styles.input}
        // placeholder="Expected Expenditure"
        value={plan.expectedExpenditure.toString()}
        onChangeText={(text) => setPlan((prev) => ({
          ...prev,
          expectedExpenditure: text ? parseFloat(text) : 0,
        }))}
        keyboardType="numeric"
      />

    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Places to Visit</Text>
      <View style={styles.placeForm}>
        <TextInput
          style={styles.input}
          placeholder="Place Name"
          value={newPlace.name}
          onChangeText={(text) => setNewPlace((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g., 2 days)"
          value={newPlace.duration}
          onChangeText={(text) => setNewPlace((prev) => ({ ...prev, duration: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Notes"
          value={newPlace.notes}
          onChangeText={(text) => setNewPlace((prev) => ({ ...prev, notes: text }))}
          multiline
        />
        <Text style={styles.inputLabel}>Expected Expenditure</Text>
        <TextInput
          style={styles.input}
          // placeholder="Expenses"
          value={newPlace.expenses_places.toString()}
          onChangeText={(text) => setNewPlace((prev) => ({
            ...prev,
            expenses_places: text ? parseFloat(text) : 0,
          }))}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addPlace}>
          <Text style={styles.buttonText}>Add Place</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.placesList}>
        {plan.places.map((place, index) => (
          <View key={index} style={styles.placeItem}>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeDuration}>{place.duration}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePlace(index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep4 = () => {
    const handleEmailsChange = (text: string) => {
      const emailArray = text.split(',').map(email => email.trim());
      setPlan(prev => ({ ...prev, invitedEmails: emailArray }));
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Additional Details</Text>
        
        <Text style={styles.sectionTitle}>Plan Visibility</Text>
        <View style={styles.visibilityContainer}>
          <TouchableOpacity 
            style={[
              styles.visibilityOption,
              plan.visibility === 'private' && styles.visibilityOptionSelected
            ]}
            onPress={() => setPlan(prev => ({ ...prev, visibility: 'private' }))}
          >
            <Text style={[
              styles.visibilityText,
              plan.visibility === 'private' && styles.visibilityTextSelected
            ]}>Private</Text>
            <Text style={styles.visibilityDescription}>Only you can see this plan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.visibilityOption,
              plan.visibility === 'invited' && styles.visibilityOptionSelected
            ]}
            onPress={() => setPlan(prev => ({ ...prev, visibility: 'invited' }))}
          >
            <Text style={[
              styles.visibilityText,
              plan.visibility === 'invited' && styles.visibilityTextSelected
            ]}>Invited Only</Text>
            <Text style={styles.visibilityDescription}>Only invited people can see this plan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.visibilityOption,
              plan.visibility === 'public' && styles.visibilityOptionSelected
            ]}
            onPress={() => setPlan(prev => ({ ...prev, visibility: 'public' }))}
          >
            <Text style={[
              styles.visibilityText,
              plan.visibility === 'public' && styles.visibilityTextSelected
            ]}>Public</Text>
            <Text style={styles.visibilityDescription}>Anyone using the app can see this plan</Text>
          </TouchableOpacity>
        </View>

        {plan.visibility === 'invited' && (
          <View style={styles.inviteSection}>
            <Text style={styles.sectionTitle}>Invite Participants</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter email addresses (comma-separated)"
              value={plan.invitedEmails.join(', ')}
              onChangeText={handleEmailsChange}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.helperText}>
              Example: john@example.com, jane@example.com
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Accommodation</Text>
        <TextInput
          style={styles.input}
          placeholder="Accommodation Details"
          value={plan.accommodation}
          onChangeText={(text) => setPlan((prev) => ({ ...prev, accommodation: text }))}
          multiline
        />

        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional Notes"
          value={plan.additionalNotes}
          onChangeText={(text) => setPlan((prev) => ({ ...prev, additionalNotes: text }))}
          multiline
          numberOfLines={4}
        />
      </View>
    );
  };
  

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return !!plan.destination && plan.startDate <= plan.endDate;
      case 2:
        return !!plan.vehicle && !!plan.expectedExpenditure;
      case 3:
        return plan.places.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              currentStep > index && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={[styles.navButton, !validateStep() && styles.navButtonDisabled]}
            onPress={() => validateStep() && setCurrentStep(currentStep + 1)}
            disabled={!validateStep()}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.saveButton]}
            onPress={savePlan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Save Plan</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C1CB9C',
  },
  progressBar: {
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3A4646',
  },
  progressDot: {
    width: 20,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 10,
  },
  progressDotActive: {
    backgroundColor: '#89965a',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3A4646',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 18,
  },
  inputLabel: {
    color: '#3A4646',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 18,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  placeForm: {
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#3A4646',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  placesList: {
    maxHeight: 200,
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeDuration: {
    fontSize: 16,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#333',
  },
  visibilityContainer: {
    marginBottom: 20,
  },
  visibilityOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  visibilityOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  visibilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  visibilityTextSelected: {
    color: '#007AFF',
  },
  visibilityDescription: {
    fontSize: 14,
    color: '#666',
  },
  inviteSection: {
    marginBottom: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
    marginLeft: 5,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navButton: {
    backgroundColor: '#388c4c',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#d1d1cf',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});