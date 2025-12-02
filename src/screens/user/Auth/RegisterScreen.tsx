  import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

  export default function RegisterScreen() {
    const handleRegister = () => {
      // Logic đăng ký sẽ ở đây
      Alert.alert("Thông báo", "Chức năng Đăng ký chưa hoạt động.");
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đăng Ký Tài Khoản</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            placeholder="Chọn tên đăng nhập"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Tạo mật khẩu"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng Ký</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('./Login')}> {/* replace để không quay lại màn hình register */}
          <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E8F5E9', // Màu nền nhẹ nhàng
      padding: 20,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#2E7D32', // Màu tiêu đề xanh đậm
      marginBottom: 40,
    },
    inputGroup: {
      width: '100%',
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      color: '#4CAF50', // Màu label xanh
      marginBottom: 5,
    },
    input: {
      width: '100%',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#A5D6A7', // Viền input xanh nhẹ
      fontSize: 16,
    },
    button: {
      backgroundColor: '#2E7D32', // Nút màu xanh đậm
      width: '100%',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    linkText: {
      color: '#1A531B', // Link màu xanh đậm hơn
      fontSize: 16,
    },
  });