import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig.ts';  
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');  
  const [lastName, setLastName] = useState('');    
  const [contactInfo, setContactInfo] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  // Sign In function
  const signIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log(res);
      console.log('User logged in successfully!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' as never}],  
      });
    } catch (error: any) {
      console.log(error);
      Alert.alert('Login Error', 'Invalid email or password: ' + error.message);
    }
    setLoading(false);
  };

  // Sign Up function
  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(FIREBASE_DB, 'users', user.uid), {
        firstName: firstName,
        lastName: lastName,
        contactInfo: contactInfo,
        email: email,
        uid: user.uid,
      });

      Alert.alert('Success', 'Account created successfully!');
      setIsLogin(true); 
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign-Up Error', 'Check your email and password: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

        {!isLogin && ( 
          <>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Info"
              value={contactInfo}
              onChangeText={setContactInfo}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={isLogin ? signIn : signUp}>
              <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleButtonText}>
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 30,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginVertical: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
