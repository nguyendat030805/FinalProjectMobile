import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OrderItem = {
    id: string;
    orderId: string;
    totalAmount: number;
    deliveryAddress: string;
    phone: string;
    deliveryMethod: string;
    paymentMethod: string;
    orderDate: string;
    status: string;
};

const OrderHistoryScreen = ({ navigation }: any) => {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const user = await AsyncStorage.getItem('loggedInUser');
            if (!user) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập');
                return;
            }

            const userData = JSON.parse(user);
            const ordersStr = await AsyncStorage.getItem(`orders_${userData.username}`);
            if (ordersStr) {
                const ordersData = JSON.parse(ordersStr);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#FF9800';
            case 'confirmed':
                return '#2196F3';
            case 'shipped':
                return '#4CAF50';
            case 'delivered':
                return '#27AE60';
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return '⏳ Chờ xác nhận';
            case 'confirmed':
                return '✓ Đã xác nhận';
            case 'shipped':
                return '📦 Đang vận chuyển';
            case 'delivered':
                return '✅ Đã giao';
            case 'cancelled':
                return '✗ Đã hủy';
            default:
                return status;
        }
    };

    const renderOrderItem = ({ item }: { item: OrderItem }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => {
                Alert.alert(
                    `Đơn hàng ${item.orderId}`,
                    `Tổng: ${item.totalAmount.toLocaleString('vi-VN')} đ\n` +
                        `Địa chỉ: ${item.deliveryAddress}\n` +
                        `Phương thức: ${item.deliveryMethod === 'express' ? 'Nhanh hôm nay' : 'Tiêu chuẩn'}\n` +
                        `Thanh toán: ${getPaymentLabel(item.paymentMethod)}`
                );
            }}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <Text
                    style={[styles.status, { color: getStatusColor(item.status) }]}
                >
                    {getStatusLabel(item.status)}
                </Text>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>📅 Ngày:</Text>
                    <Text style={styles.value}>
                        {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>💰 Tổng:</Text>
                    <Text style={styles.totalAmount}>
                        {item.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>📍 Địa chỉ:</Text>
                    <Text style={styles.value} numberOfLines={1}>
                        {item.deliveryAddress}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color="#d11050ff" />
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                <Text style={styles.emptySubtitle}>Hãy mua sắm để tạo đơn hàng đầu tiên</Text>
                <TouchableOpacity
                    style={styles.shopBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.shopBtnText}>Bắt đầu mua sắm</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.orderId}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const getPaymentLabel = (method: string) => {
    switch (method) {
        case 'credit_card':
            return 'Thẻ tín dụng';
        case 'bank_transfer':
            return 'Chuyển khoản';
        case 'cod':
            return 'Thanh toán khi nhận';
        default:
            return method;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderId: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000ff',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    value: {
        fontSize: 13,
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f80404ff',
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    shopBtn: {
        backgroundColor: '#E91E63',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default OrderHistoryScreen;
