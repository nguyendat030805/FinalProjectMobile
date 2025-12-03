import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabParamList } from '../navigation/AppTabs';

const Header = () => {
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const navigation =
        useNavigation<NativeStackNavigationProp<BottomTabParamList>>();
        
    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                const loggedInUser = await AsyncStorage.getItem('loggedInUser');
                try {
                    setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
                } catch (error) {
                    console.error("Lỗi parse user từ AsyncStorage:", error);
                    setUser(null);
                }
            };
            loadUser();
        }, [])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem('loggedInUser');
        setUser(null); 
        navigation.navigate('LoginSqlite' as never); 
    };

    return (
        <View style={styles.header}>
            {user ? (
                <>
                    <Text style={styles.userInfo}>
                        Xin chào, <Text style={styles.usernameText}>{String(user.username)}</Text> <Text style={styles.roleText}></Text>
                    </Text>
                
                </>
            ) : (
                <Text style={styles.appTitle}>Siêu Xe App</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15, 
        paddingVertical: 10,  
        backgroundColor: '#F0BA5C',
    },
    appTitle: {
        color: '#4e3e07ff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userInfo: {
        color: '#4e3e07ff',
        fontSize: 14,
    },
    usernameText: {
        fontWeight: 'bold',
        color: '#4e3e07ff', 
    },
    roleText: {
        fontWeight: 'bold',
        color: '#b3e5fc', 
        textTransform: 'capitalize',
    },
    logoutButton: {
        backgroundColor: '#ff5252',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default Header;