import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from '../HomeScreen';
import { useCart } from '../../context/CartContext';
import { saveOrder } from '../../database';
import { getImageSource } from '../../database';

type CheckoutScreenProps = NativeStackScreenProps<HomeStackParamList, 'Checkout'>;

const CheckoutScreen = ({ navigation, route }: CheckoutScreenProps) => {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [loading, setLoading] = useState(false);

    const deliveryFee = deliveryMethod === 'express' ? 50000 : 20000;
    const totalPrice = getTotalPrice();
    const finalTotal = totalPrice + deliveryFee;

    const handlePlaceOrder = async () => {
        // Validation
        if (!address.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
            return;
        }
        if (!phone.trim() || phone.length < 10) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ');
            return;
        }
        if (cartItems.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng trống');
            return;
        }

        try {
            setLoading(true);

            // Get user info
            const userStr = await AsyncStorage.getItem('loggedInUser');
            if (!userStr) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
                navigation.navigate('Home');
                return;
            }

            const user = JSON.parse(userStr);

            // Create order in database
            const orderDate = new Date().toISOString();
            const orderData = {
                userId: user.username,
                totalAmount: finalTotal,
                deliveryAddress: address,
                phone: phone,
                deliveryMethod: deliveryMethod,
                paymentMethod: paymentMethod,
                orderDate: orderDate,
                status: 'pending',
            };

            // Save order to storage and navigate to confirmation
            const orderId = `ORD-${Date.now()}`;
            await saveOrder(orderId, orderData, user.username, cartItems);

            // Navigate to confirmation with order details
            navigation.navigate('OrderConfirm' as any, {
                orderId,
                orderData,
                cartItems,
                totalPrice: finalTotal,
            });

            // Clear cart after successful order
            clearCart();
        } catch (error) {
            console.error('Order error:', error);
            Alert.alert('Lỗi', 'Không thể tạo đơn hàng, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>⚠️</Text>
                <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.backBtnText}>Quay lại mua hàng</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Tóm tắt đơn hàng</Text>
                    <View style={styles.summaryBox}>
                        {cartItems.map((item: any, index: number) => (
                            <View key={`${item.product.id}-${index}`} style={styles.summaryItem}>
                                <Image
                                    source={getImageSource(item.product.img)}
                                    style={styles.summaryImage}
                                />
                                <View style={styles.summaryDetails}>
                                    <Text style={styles.summaryName} numberOfLines={1}>
                                        {item.product.name}
                                    </Text>
                                    <Text style={styles.summaryInfo}>
                                        Màu: {item.color} | SL: {item.quantity}
                                    </Text>
                                    <Text style={styles.summaryPrice}>
                                        {item.totalPrice.toLocaleString('vi-VN')} đ
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập địa chỉ giao hàng"
                        placeholderTextColor="#999"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Phone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📞 Số điện thoại</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#999"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Delivery Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚚 Phương thức giao hàng</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={deliveryMethod}
                            onValueChange={(itemValue) => setDeliveryMethod(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Tiêu chuẩn (20.000 đ)" value="standard" />
                            <Picker.Item label="Nhanh hôm nay (50.000 đ)" value="express" />
                        </Picker>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={paymentMethod}
                            onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Thẻ tín dụng" value="credit_card" />
                            <Picker.Item label="Chuyển khoản ngân hàng" value="bank_transfer" />
                            <Picker.Item label="Thanh toán khi nhận hàng" value="cod" />
                        </Picker>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={styles.priceBreakdown}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tiền hàng:</Text>
                        <Text style={styles.priceValue}>
                            {totalPrice.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Phí giao hàng:</Text>
                        <Text style={styles.priceValue}>
                            {deliveryFee.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>
                            {finalTotal.toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelBtnText}>Quay lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmBtnText}>Đặt hàng</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    backBtn: {
        backgroundColor: '#E91E63',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginRight: 12,
    },
    summaryDetails: {
        flex: 1,
    },
    summaryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    summaryInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    summaryPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f10404ff',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    picker: {
        color: '#333',
    },
    priceBreakdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        borderBottomWidth: 2,
        borderBottomColor: '#e9981eff',
        marginTop: 8,
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f70d0dff',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#e1a612ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnDisabled: {
        opacity: 0.6,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CheckoutScreen;
