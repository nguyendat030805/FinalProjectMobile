import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomTabParamList } from '../navigation/AppTabs';
import { addUser } from '@/src/database';
import { LinearGradient } from 'expo-linear-gradient';

const SignupSqlite = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // default 'user'
    
    const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();

    const handleSignup = async () => {
        if (!username || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            const success = await addUser(username, password, role);
            if (success) {
                Alert.alert('Thành công', 'Đăng ký thành công!', [
                    { text: 'OK', onPress: () => navigation.navigate('LoginSqlite') },
                ]);
            } else {
                Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại hoặc đăng ký thất bại');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đăng ký thất bại');
        }
    };

    return (
        <LinearGradient
            colors={['#000000', '#1a1a1a', '#333']}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* LOGO / BRAND */}
                <Text style={styles.logo}>⚜</Text>
                <Text style={styles.brand}>SIGNUP</Text>

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
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <LinearGradient
                            colors={['#c2a671', '#e0c48c', '#f1d9a3']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('LoginSqlite')}>
                        <Text style={styles.switchText}>
                            Đã có tài khoản? <Text style={styles.goldText}>Đăng nhập ngay</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    glassCard: {
        width: '100%',
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(212,175,55,0.4)',
        borderWidth: 1,
        backdropFilter: 'blur(15px)',
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

export default SignupSqlite;
