import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator,
    SafeAreaView,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Đảm bảo đường dẫn import chính xác
import { updateUser, getUserById, User } from '../database'; 

// Định nghĩa ParamList tùy chỉnh nếu cần, nhưng để đơn giản, ta dùng any cho navigation

// Kiểu dữ liệu tối giản của người dùng lưu trong AsyncStorage
interface LoggedInUserLite {
    id: number;
    username: string;
    role: string;
}

// Định nghĩa kiểu dữ liệu cho navigation (sử dụng kiểu rộng hơn để reset hoạt động)
type NavigationProps = NativeStackNavigationProp<any>;

const UserProfile = () => {
    // 🛑 FIX: Sử dụng kiểu rộng hơn cho navigation
    const navigation = useNavigation<NavigationProps>();
    
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false); 

    // State chứa dữ liệu FORM để chỉnh sửa
    const [currentUsername, setCurrentUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [currentRole, setCurrentRole] = useState(''); 
    
    // State lưu trữ dữ liệu gốc (để hiển thị ở View Mode)
    const [originalUsername, setOriginalUsername] = useState('');
    const [originalRole, setOriginalRole] = useState('');


    // --- 1. Tải thông tin người dùng hiện tại (Load Data) ---
    const loadUserData = useCallback(async () => {
        setLoading(true);
        try {
            const loggedInUserString = await AsyncStorage.getItem('loggedInUser');
            if (!loggedInUserString) {
                Alert.alert("Lỗi", "Bạn chưa đăng nhập.");
                navigation.goBack();
                return;
            }
            
            const loggedInUser: LoggedInUserLite = JSON.parse(loggedInUserString);
            const userFullData = await getUserById(loggedInUser.id);
            
            if (userFullData) {
                setUserId(userFullData.id);
                
                // Đặt các state cho Form và state Gốc
                setCurrentUsername(userFullData.username);
                setCurrentPassword(userFullData.password); 
                setCurrentRole(userFullData.role);
                
                setOriginalUsername(userFullData.username);
                setOriginalRole(userFullData.role);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu người dùng:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu người dùng.");
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
            return; 
        }, [loadUserData])
    );

    // --- 2. Xử lý Đăng Xuất (LOGOUT) ---
    const handleLogout = () => {
        Alert.alert(
            "Xác nhận Đăng Xuất",
            "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Đăng Xuất", 
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('loggedInUser');
                            
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể đăng xuất.");
                        }
                    }
                }
            ]
        );
    };

    // --- 3. Xử lý Cập nhật Profile ---
    const handleUpdate = async () => {
        if (!currentUsername.trim() || !currentPassword.trim()) {
            Alert.alert("Lỗi", "Tên người dùng và mật khẩu không được để trống.");
            return;
        }

        if (userId === null) {
            Alert.alert("Lỗi", "Không tìm thấy ID người dùng để cập nhật.");
            return;
        }
        
        try {
            const updatedUser: User = {
                id: userId,
                username: currentUsername,
                password: currentPassword,
                role: currentRole
            };
            
            await updateUser(updatedUser);
            
            // Cập nhật AsyncStorage nếu cập nhật thành công
            const newLiteUser = JSON.stringify({ id: userId, username: currentUsername, role: currentRole });
            await AsyncStorage.setItem('loggedInUser', newLiteUser);

            setOriginalUsername(currentUsername); 
            
            Alert.alert("Thành công", "Cập nhật thông tin thành công!");
            
            setIsEditing(false); 
            
        } catch (error) {
            console.error("Lỗi cập nhật người dùng:", error);
            Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
        }
    };
    
    // Hàm xử lý Hủy Chỉnh sửa
    const handleCancelEdit = () => {
        // Tải lại dữ liệu gốc an toàn hơn
        loadUserData(); 
        setIsEditing(false);
    };


    // --- 4. Giao diện Chế độ Xem (VIEW MODE) ---
    const renderViewMode = () => (
        <ScrollView contentContainerStyle={styles.container}>
            
            <Text style={styles.headerTitle}>Hồ Sơ Tài Khoản</Text>
            <Text style={styles.subtitle}>
                Thông tin tài khoản của bạn. Nhấn Chỉnh Sửa để thay đổi.
            </Text>
            
            {/* Dòng Tên Người Dùng */}
            <View style={styles.infoRowSimple}>
                <Text style={styles.infoLabel}>Tên Người Dùng:</Text>
                <Text style={styles.infoValue}>{originalUsername}</Text>
            </View>

            {/* Dòng Vai Trò */}
            <View style={[styles.infoRowSimple]}>
                <Text style={styles.infoLabel}>Vai Trò:</Text>
                <Text style={styles.roleTag}>{originalRole}</Text>
            </View>
            
            {/* CONTAINER CHỨA HAI NÚT NẰM NGANG */}
            <View style={styles.horizontalButtonContainer}>
                {/* Nút Chỉnh Sửa Profile */}
                <TouchableOpacity 
                    style={[styles.editButton, styles.flexButton]}
                    onPress={() => setIsEditing(true)} 
                >
                    <Text style={styles.editButtonText}>Chỉnh Sửa</Text>
                </TouchableOpacity>

                {/* NÚT ĐĂNG XUẤT */}
                   <TouchableOpacity 
                    style={[styles.logoutButton, styles.flexButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // --- 5. Giao diện Chế độ Chỉnh sửa (EDIT MODE) ---
    const renderEditMode = () => (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerTitle}>Chỉnh Sửa Thông Tin Cá Nhân</Text>
            <Text style={styles.subtitle}>
                Thay đổi thông tin và nhấn Lưu để áp dụng.
            </Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Tên Người Dùng</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tên người dùng mới"
                    value={currentUsername}
                    onChangeText={setCurrentUsername}
                />
            </View>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>Mật Khẩu Mới</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới (hoặc giữ nguyên)"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Vai Trò (Không thể chỉnh sửa)</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={currentRole}
                    editable={false}
                />
            </View>


            <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdate}
            >
                <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelEdit} 
            >
                <Text style={styles.cancelButtonText}>Hủy Bỏ</Text>
            </TouchableOpacity>
        </ScrollView>
    );
    
    // --- Render Chính ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {isEditing ? renderEditMode() : renderViewMode()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
 safeArea: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#ffffff', // nền tối sang trọng
 },
 container: {
    padding: 20,
    flexGrow: 1,
    width: '100%',
 },
 headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0c0c0dff',
    marginBottom: 8,
    textAlign: 'center',
 },
 subtitle: {
    fontSize: 15,
    color: '#585555ff',
    textAlign: 'center',
    marginBottom: 25,
 },

 // Card hiển thị thông tin
 infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
 },
 infoRowSimple: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
 },
 infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0d0d0eff',
 },
 infoValue: {
    fontSize: 15,
    color: '#fbc531',
    fontWeight: '500',
    textAlign: 'right',
 },
 roleTag: {
    backgroundColor: '#fbc531',
    color: '#2f3640',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    alignSelf: 'flex-end',
 },

 // Form
 formGroup: {
    marginBottom: 15,
 },
 label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101112ff',
    marginBottom: 5,
 },
 input: {
    height: 45,
    borderColor: '#edf1f6ff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#e2e6edff',
    color: '#0f1010ff',
    fontSize: 15,
 },
 disabledInput: {
    backgroundColor: '#e2e6edff',
    color: '#010202ff',
 },

 // Buttons
 horizontalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
 },
 flexButton: {
    flex: 1,
    marginHorizontal: 6,
 },
 editButton: {
    backgroundColor: '#ffae00ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
 },
 editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
 },
 logoutButton: {
    backgroundColor: '#e8c218ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
 },
 logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
 },
 saveButton: {
    backgroundColor: '#44bd32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
 },
 saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
 },
 cancelButton: {
    backgroundColor: '#fbc531',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
 },
 cancelButtonText: {
    color: '#2f3640',
    fontSize: 15,
    fontWeight: '600',
 },
 backButton: {
    padding: 10,
    marginTop: 15,
    alignItems: 'center',
 },
 backButtonText: {
    color: '#dcdde1',
    fontSize: 14,
 },

 // Loading
 loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 },
 loadingText: {
    marginTop: 10,
    color: '#dcdde1',
 },
});


export default UserProfile;