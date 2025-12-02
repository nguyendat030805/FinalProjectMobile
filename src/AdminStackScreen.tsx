import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AdminDashboard from './screens/admin/AdminDashboard';

const Stack = createNativeStackNavigator();

const AdminStackScreen = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: true }}>
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboard}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AdminStackScreen;
