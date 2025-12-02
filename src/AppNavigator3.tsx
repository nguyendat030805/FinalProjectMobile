import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AppTabs from './navigation/AppTabs';
import { CartProvider } from './context/CartContext';
import { HomeStackParamList } from './Types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const AppNavigator3 = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </CartProvider>
  );
};

export default AppNavigator3;