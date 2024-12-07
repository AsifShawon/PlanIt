import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import Login from './app/auth/login'; 
import HomeScreen from './app/(tabs)/home'; 
import CreatePlan from './app/(tabs)/createPlan'; 
import ProfileScreen from './app/(tabs)/profile'; 
import MyPlans from './app/screens/MyPlansScreen';
import PlanDetails from './app/screens/planScreen';
import EditPlan from './app/screens/editPlan';
import AllPublicPlansScreen from './app/screens/publicPlans';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for Home, Explore, and Profile
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#C1CB9C',
        tabBarStyle: { backgroundColor: '#3A4646' },
        headerStyle: { backgroundColor: '#3A4646' },
        headerTintColor: '#D0D0D0',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="CreatePlan"
        component={CreatePlan}
        options={{
          headerShown: false,
          title: 'Create Plan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'create' : 'create-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle-sharp' : 'person-circle-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator to manage login flow
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyPlans"
          component={MyPlans}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Plan"
          component={PlanDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditPlan"
          component={EditPlan}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="publicplans"
          component={AllPublicPlansScreen}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
