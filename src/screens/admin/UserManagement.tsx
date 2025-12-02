import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    Alert, 
    TouchableOpacity, 
    ListRenderItem,
    ActivityIndicator,
    ScrollView,
    Modal
} from 'react-native';

import { 
    fetchUsers, 
    addUser, 
    updateUser as updateDbUser, 
    deleteUser as deleteDbUser, 
    initDatabase, 
    resetAndInitDatabase,
    User 
} from '../../database'; // Thay đổi đường dẫn theo cấu trúc project của bạn
import { getOrders, updateOrderStatus } from '../../utils/orderStorage'; // Thay đổi đường dẫn theo cấu trúc project của bạn

const USER_ROLES = ['admin', 'user', 'guest'] as const;
type UserRole = (typeof USER_ROLES)[number]; 

const UserManagementScreen = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const [dbInitialized, setDbInitialized] = useState<boolean>(false);
    
    // Form States
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<UserRole>('user'); 
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false); 
    
    // Order Modal States
    const [showOrdersModal, setShowOrdersModal] = useState<boolean>(false);
    const [ordersForUser, setOrdersForUser] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
    const [selectedUsername, setSelectedUsername] = useState<string>('');

    const resetForm = (): void => {
        setUsername('');
        setPassword('');
        setRole('user');
        setEditingUser(null);
    }
    
    const loadUsers = async () => {
        if (!dbInitialized) return;
        setLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể nạp dữ liệu người dùng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initDatabase(async () => {
            setDbInitialized(true); 
        }); 
    }, []);

    useEffect(() => {
        if (dbInitialized) {
            const delayedLoad = setTimeout(() => {
                loadUsers();
            }, 300);
            return () => clearTimeout(delayedLoad);
        }
    }, [dbInitialized]);
    
    const handleSaveUser = async (): Promise<void> => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Lỗi", "Tên người dùng và Mật khẩu không được để trống.");
            return;
        }
        try {
            if (editingUser) {
                const userToUpdate: User = { id: editingUser.id, username, password, role };
                await updateDbUser(userToUpdate); 
                Alert.alert("Thành công", `Cập nhật người dùng ${username} thành công!`);
            } else {
                const success = await addUser(username, password, role); 
                if (success) {
                    Alert.alert("Thành công", `Đã thêm người dùng ${username}.`);
                } else {
                     Alert.alert("Lỗi", "Không thể thêm người dùng. Tên đã tồn tại.");
                     return;
                }
            }
            await loadUsers();
            setShowModal(false); // Đóng modal sau khi lưu
        } catch (error) {
            Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình lưu dữ liệu.");
        }
        resetForm();
    };

    const handleDeleteUser = (id: number, uname: string): void => { 
        Alert.alert(
            "Xác nhận Xóa",
            `Bạn có chắc chắn muốn xóa người dùng "${uname}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            await deleteDbUser(id); 
                            setUsers(users.filter(u => u.id !== id));
                            Alert.alert("Thành công", "Xóa người dùng thành công!");
                            if (editingUser?.id === id) {
                                resetForm();
                            }
                        } catch (error) {
                            Alert.alert("Lỗi", "Xảy ra lỗi khi xóa người dùng.");
                        }
                    }
                }
            ]
        );
    };

    const handleEditUser = (user: User): void => { 
        setEditingUser(user);
        setUsername(user.username);
        setPassword(user.password); 
        setRole(user.role as UserRole);
    };

    const viewUserOrders = async (user: User) => {
        try {
            setLoadingOrders(true);
            setSelectedUsername(user.username);
            const orders = await getOrders(user.username);
            setOrdersForUser(orders || []);
            setShowOrdersModal(true);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải đơn hàng của người dùng này');
        } finally {
            setLoadingOrders(false);
        }
    };

    // --- Hàm chỉnh sửa trạng thái đơn hàng ---
    const handleEditOrderStatus = (orderId: string) => {
        Alert.alert(
            "Chỉnh sửa trạng thái",
            "Chọn trạng thái mới cho đơn hàng",
            [
                { text: "Đang xử lý", onPress: async () => await changeStatus(orderId, "Đang xử lý") },
                { text: "Đã giao", onPress: async () => await changeStatus(orderId, "Đã giao") },
                { text: "Đã hủy", onPress: async () => await changeStatus(orderId, "Đã hủy") },
                { text: "Đóng", style: "cancel" }
            ]
        );
    };

    const changeStatus = async (orderId: string, newStatus: string) => {
        try {
            const success = await updateOrderStatus(selectedUsername, orderId, newStatus);
            if (success) {
                Alert.alert("Thành công", `Đơn hàng ${orderId} đã được cập nhật trạng thái.`);
                // Tải lại danh sách đơn hàng cho người dùng đang xem
                const updatedOrders = await getOrders(selectedUsername);
                setOrdersForUser(updatedOrders);
            } else {
                Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng.");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };
    
    // --- Lấy màu chữ cho Role ---
    const getTextColorForRole = (role: string): string => {
        switch (role) {
            case 'admin': return '#D32F2F'; // Đỏ đậm
            case 'user': return '#1976D2'; // Xanh dương
            case 'guest': return '#616161'; // Xám
            default: return '#000000';
        }
    };
    
    // --- Lấy màu viền bên trái cho Item ---
    const getBorderColorForRole = (role: string): string => {
        switch (role) {
            case 'admin': return '#ffffffff'; // Cam cho Admin
            case 'user': return '#2196F3'; // Xanh dương cho User
            case 'guest': return '#9E9E9E'; // Xám cho Guest
            default: return '#4CAF50';
        }
    };
    
    // --- Lấy style trạng thái đơn hàng ---
    const getOrderStatusStyle = (status: string) => {
        let color = '#757575';
        if (status.includes('xử lý')) color = '#FF9800'; // Cam
        else if (status.includes('giao')) color = '#4CAF50'; // Xanh lá
        else if (status.includes('hủy')) color = '#F44336'; // Đỏ
        return {
            fontWeight: 'bold',
            color: color,
        };
    };

    if (loading || !dbInitialized) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.title}>Đang kết nối/tải dữ liệu...</Text>
            </View>
        );
    }
    
    // --- Render Item (Đã cập nhật CSS) ---
    const renderUserItem: ListRenderItem<User> = ({ item }) => (
        <View style={[styles.item, { borderLeftColor: getBorderColorForRole(item.role) }]}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                    <Text style={{ fontWeight: 'bold', color: '#1C2E4A' }}>{item.username}</Text>
                    <Text style={[styles.itemRoleText, { color: getTextColorForRole(item.role) }]}>
                        {' '} ({item.role})
                    </Text>
                </Text>
                <Text style={styles.itemEmail}>ID: {item.id} | Pass: {Array(item.password?.length || 6).fill('•').join('')}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#D1772E' }]} onPress={() => viewUserOrders(item)}>
                    <Text style={styles.actionButtonText}>Đơn hàng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E4A84E' }]} onPress={() => { handleEditUser(item); setShowModal(true); }}>
                    <Text style={styles.actionButtonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#B45F22' }]} onPress={() => handleDeleteUser(item.id, item.username)}>
                    <Text style={styles.actionButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
    
    // --- Component chính (Đã thêm Header và Modal Tạo/Sửa) ---
    return (
        <View style={styles.container}>
            
            {/* Header Mới */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTitleRow}>
                    <Text style={styles.title}>Quản Lý Người Dùng</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setShowModal(true); }}>
                        <Text style={styles.addButtonText}>+ Thêm</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Tổng cộng: {users.length} tài khoản</Text>
            </View>
            
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            
            {/* Modal Tạo/Sửa Người dùng */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => { resetForm(); setShowModal(false); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Tên người dùng"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu (yêu cầu)"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.roleSelectionContainer}>
                            {USER_ROLES.map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[
                                        styles.roleButton, 
                                        role === r && styles.roleButtonActive,
                                        { backgroundColor: role === r ? getBorderColorForRole(r) : '#E0E0E0' }
                                    ]}
                                    onPress={() => setRole(r)}
                                >
                                    <Text style={[
                                        styles.roleButtonText, 
                                        { color: role === r ? '#FFFFFF' : '#333' }
                                    ]}>
                                        {r.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <View style={styles.modalActionButtons}>
                            <TouchableOpacity style={[styles.actionButton, styles.modalButton, { backgroundColor: '#F44336' }]} onPress={() => { resetForm(); setShowModal(false); }}>
                                <Text style={styles.actionButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.modalButton, { backgroundColor: '#4CAF50' }]} onPress={handleSaveUser}>
                                <Text style={styles.actionButtonText}>{editingUser ? 'Cập Nhật' : 'Lưu'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Modal hiển thị đơn hàng */}
            <Modal
                visible={showOrdersModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowOrdersModal(false);
                    setOrdersForUser([]);
                    setSelectedUsername('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '85%' }] }>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Đơn hàng của: {selectedUsername}</Text>
                            <TouchableOpacity onPress={() => setShowOrdersModal(false)}>
                                <Text style={{ fontSize: 24, color: '#333' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingOrders ? (
                            <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {ordersForUser.length === 0 ? (
                                    <Text style={styles.emptyListText}>Người dùng này chưa có đơn hàng nào.</Text>
                                ) : (
                                    ordersForUser.map((o, idx) => (
                                        <View key={o.orderId || idx} style={styles.orderItem}>
                                            <View style={styles.orderItemHeader}>
                                                <Text style={styles.orderIdText}>{o.orderId}</Text>
                                                <Text>
                                                    {o.status}
                                                </Text>
                                            </View>
                                            <Text>Ngày: {new Date(o.orderDate).toLocaleString('vi-VN')}</Text>
                                            <Text>Tổng: {Number(o.totalAmount).toLocaleString('vi-VN')} đ</Text>
                                            <Text>Phương thức: {o.paymentMethod}</Text>
                                        
                                            {o.items && o.items.length > 0 && (
                                                <View style={{ marginTop: 10, paddingLeft: 5, borderLeftWidth: 2, borderLeftColor: '#F0F0F0' }}>
                                                    <Text style={{ fontWeight: '600', color: '#555' }}>Sản phẩm đã mua:</Text>
                                                    {o.items.map((it: any, i: number) => (
                                                        <Text key={i} style={{ fontSize: 13, color: '#666' }}>
                                                            - {it.product?.name || 'Sản phẩm không tên'} x{it.quantity} ({it.color})
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                            <TouchableOpacity 
                                                style={[styles.actionButton, { backgroundColor: '#FF9800', marginTop: 10 }]}
                                                onPress={() => handleEditOrderStatus(o.orderId)} 
                                            >
                                                <Text style={styles.actionButtonText}>Chỉnh sửa trạng thái</Text>
                                            </TouchableOpacity>

                                        </View>
                                    ))
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
            
            <View style={styles.listSection}>
                <Text style={[styles.subtitle, { marginHorizontal: 20, marginBottom: 10, fontWeight: 'bold', color: '#1C2E4A' }]}>DANH SÁCH TÀI KHOẢN</Text>
                
                {users.length === 0 && !loading && (
                    <Text style={styles.emptyListText}>Chưa có người dùng nào. Vui lòng thêm bằng nút "Thêm" ở trên.</Text>
                )}

                {users.length > 0 && users.map((item, index) => (
                    <View key={item.id}>
                        {renderUserItem({ item, index, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } })}
                    </View>
                ))}
            </View>

            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f8f5ff', // Màu nền sáng, hiện đại
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    // --- Header & Title ---
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#ffffffff', // Nền trắng cho header
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C2E4A', // Màu chữ đậm
    },
    subtitle: {
        fontSize: 14,
        color: '#607D8B',
        marginTop: 5,
    },
    addButton: {
        backgroundColor: '#D1772E', // Xanh lá cây
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    listSection: {
        paddingTop: 10,
    },
    // --- User List Item ---
    item: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#FEE8B4',
        borderRadius: 10,
        borderLeftWidth: 5, // Điểm nhấn màu sắc
        // borderLeftColor được set dynamic trong renderUserItem
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    itemInfo: {
        flex: 1,
        marginRight: 10,
    },
    itemName: {
        fontSize: 14,
        marginBottom: 2,
        color: '#333',
    },
    itemRoleText: {
        fontWeight: '900', // Đậm hơn
    },
    itemEmail: {
        fontSize: 13,
        color: '#9E9E9E', // Màu xám nhẹ cho thông tin phụ
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        borderRadius: 5,
        marginLeft: 6,
        minWidth: 70,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyListText: {
        textAlign: 'center',
        color: '#757575',
        marginTop: 50,
        fontSize: 16,
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền tối hơn
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#0F1115',
        borderRadius: 15,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1C2E4A',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#F9F9F9',
        color: '#333',
    },
    roleSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    roleButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    roleButtonActive: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    roleButtonText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    modalActionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalButton: {
        minWidth: 100,
        marginLeft: 10,
    },
    // --- Order Modal Specific Styles ---
    orderItem: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    orderItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        alignItems: 'center',
    },
    orderIdText: {
        fontWeight: '700',
        fontSize: 15,
        color: '#333',
    },
});

export default UserManagementScreen;