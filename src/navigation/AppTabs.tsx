// AppTabs.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeStackScreen from '../screens/HomeStackScreen';
import AdminStackScreen from '../screens/AdminStackScreen';
import LoginSqlite from '../sqlite/LoginSqLite';
import SignupSqlite from '../sqlite/RegissterSqLite';
import LogoutScreen from '../sqlite/LogoutScreen';

export type BottomTabParamList = {
    HomeTab: undefined;
    AdminTab: undefined; 
    SignupSqlite: undefined;
    LoginSqlite: undefined;
    LogoutScreen: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const AppTabs = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const raw = await AsyncStorage.getItem('loggedInUser');
                if (raw) {
                    const u = JSON.parse(raw);
                    setIsLoggedIn(true);
                    setRole(u?.role ?? null);
                } else {
                    setIsLoggedIn(false);
                    setRole(null);
                }
            } catch {}
        };

        checkLoginStatus();
        // Kiểm tra trạng thái login mỗi 2 giây để cập nhật UI
        const interval = setInterval(checkLoginStatus, 2000); 
        return () => clearInterval(interval);
    }, []);

    const isAdmin = role === 'admin';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar, // Đã áp dụng style căn đều
                tabBarActiveTintColor: "#FFD369",
                tabBarInactiveTintColor: "#C8C8C8",
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            {/* 1. HOME TAB (Luôn hiển thị) */}
            <Tab.Screen
                name="HomeTab"
                component={HomeStackScreen}
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="home" color={color} size={size-5} />
                }}
            />

            {/* 2. ADMIN TAB (Chỉ hiển thị khi là Admin) */}
            {isAdmin && (
                <Tab.Screen
                    name="AdminTab"
                    component={AdminStackScreen}
                    options={{
                        title: "Admin",
                        tabBarIcon: ({ color, size }) =>
                            <Ionicons name="settings" color={color} size={size-5} />
                    }}
                />
            )}

            {/* 3. SIGNUP TAB (Ẩn khi đã đăng nhập) */}
            <Tab.Screen
                name="SignupSqlite"
                component={SignupSqlite}
                options={{
                    title: "Signup",
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="person-add" size={size-5} color={color} />,
                    // tabBarButton: () => null sẽ ẩn hoàn toàn. Dùng logic này để ẩn khi đã login
                    tabBarButton: isLoggedIn ? () => null : undefined, 
                }}
            />

            {/* 4. LOGIN / LOGOUT TAB (Hiển thị luân phiên) */}
            {!isLoggedIn ? (
                <Tab.Screen
                    name="LoginSqlite"
                    component={LoginSqlite}
                    options={{
                        title: "Login",
                        tabBarIcon: ({ color, size }) =>
                            <Ionicons name="log-in" size={size-5} color={color} />,
                    }}
                />
            ) : (
                <Tab.Screen
                    name="LogoutScreen"
                    component={LogoutScreen}
                    options={{
                        title: "Logout",
                        tabBarIcon: ({ color, size }) =>
                            <Ionicons name="exit" size={size-5} color={color} />,
                    }}
                />
            )}
        </Tab.Navigator>
    );
};

export default AppTabs;

const styles = StyleSheet.create({
    tabBar: {
        height: 50,
        backgroundColor: "#111",
        borderTopWidth: 0,
        elevation: 8,
        
        // 🛠️ CHỈNH SỬA CHO CĂN ĐỀU TAB
        // 'space-evenly' phân bố đều khoảng trống giữa các mục VÀ ở hai bên cùng.
        justifyContent: 'space-evenly', 
        
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: -2 },
    },
    tabLabel: {
        fontSize: 8,
        fontWeight: "200",
    }
});