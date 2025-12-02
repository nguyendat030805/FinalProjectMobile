import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabParamList } from '../navigation/AppTabs';
import { getUserByCredentials } from '../database';

const LoginSqlite = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation2 = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            const user = await getUserByCredentials(username, password);
            if (user) {
                await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
                Alert.alert('Thành công', `Xin chào, ${user.username}!`, [
                    {
                        text: 'OK',
                        onPress: () => navigation2.navigate('HomeTab' as any),
                    },
                ]);
            } else {
                Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đăng nhập thất bại');
        }
    };

    return (
        <LinearGradient
            colors={['#000000', '#1a1a1a', '#333']}
            style={styles.gradient}
        >
            <View style={styles.container}>

                {/* LOGO / TITLE */}
                <Text style={styles.logo}>⚜</Text>
                <Text style={styles.brand}>LOGIN</Text>

                {/* FORM GLASS */}
                <View style={styles.glassCard}>
                    
                    {/* Username */}
                    <Text style={styles.label}>Tên đăng nhập</Text>
                    <TextInput
                        placeholder="Nhập tên đăng nhập"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                    />

                    {/* Password */}
                    <Text style={styles.label}>Mật khẩu</Text>
                    <TextInput
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* BUTTON */}
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <LinearGradient
                            colors={['#c2a671', '#e0c48c', '#f1d9a3']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation2.navigate('SignupSqlite')}>
                        <Text style={styles.switchText}>
                            Chưa có tài khoản? <Text style={styles.goldText}>Đăng ký ngay</Text>
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '85%',
        alignItems: 'center',
    },

    logo: {
        fontSize: 60,
        color: '#d4af37',
        marginBottom: 5,
    },

    brand: {
        fontSize: 32,
        fontWeight: '700',
        color: '#d4af37',
        letterSpacing: 2,
        textShadowColor: '#000',
        textShadowRadius: 6,
        marginBottom: 5,
    },

    subtitle: {
        color: '#bbb',
        marginBottom: 30,
        fontSize: 14,
        letterSpacing: 1,
    },

    glassCard: {
        width: '100%',
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(212,175,55,0.4)',
        borderWidth: 1,
        backdropFilter: 'blur(15px)', // Glass effect (Expo Web)
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
    },

    label: {
        color: '#d4af37',
        marginBottom: 5,
        marginTop: 10,
        fontSize: 13,
        fontWeight: '600',
    },

    input: {
        width: '100%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        color: '#fff',
        fontSize: 16,
    },

    button: {
        width: '100%',
        marginTop: 20,
    },

    buttonGradient: {
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
    },

    buttonText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    },

    switchText: {
        marginTop: 15,
        textAlign: 'center',
        color: '#ccc',
        fontSize: 14,
    },

    goldText: {
        color: '#d4af37',
        fontWeight: '700',
    },
});

export default LoginSqlite;
