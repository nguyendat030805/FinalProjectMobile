import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart, CartItem } from '../../context/CartContext';
import { HomeStackParamList } from '../HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getImageSource } from '../../database';

type CartScreenProps = NativeStackScreenProps<HomeStackParamList, 'Cart'>;

const COLORS = ['Đỏ', 'Đen', 'Bạc', 'Xanh'];

const CartScreen = ({ navigation }: CartScreenProps) => {
    const { cartItems, removeFromCart, updateCartItem, getTotalPrice } = useCart();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        try {
            const user = await AsyncStorage.getItem('loggedInUser');
            if (!user) {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập để tiếp tục', [
                    {
                        text: 'Đăng nhập',
                        onPress: () => navigation.navigate('Home'),
                    },
                    { text: 'Hủy', style: 'cancel' },
                ]);
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert('Thông báo', 'Giỏ hàng trống');
                return;
            }

            navigation.navigate('Checkout' as any, { cartItems });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tiếp tục');
        }
    };

    if (cartItems.length === 0) {
        return (
            <View style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}><Ionicons 
                    name="cart-outline" // Icon giỏ hàng đơn giản (chỉ có đường viền)
                    size={32}          // Kích thước icon
                    color="#000000"    // Màu đen
                    /></Text>
                <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm để tiếp tục</Text>
                <TouchableOpacity
                    style={styles.continueShopping}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const totalPrice = getTotalPrice();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Giỏ hàng ({cartItems.length})</Text>

                {cartItems.map((item: CartItem, index: number) => (
                    <View key={`${item.product.id}-${item.color}-${index}`} style={styles.cartItem}>
                        <Image
                            source={getImageSource(item.product.img)}
                            style={styles.productImage}
                        />

                        <View style={styles.itemDetails}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.colorLabel}>Màu: {item.color}</Text>
                            <Text style={styles.price}>
                                {item.totalPrice.toLocaleString('vi-VN')} đ
                            </Text>
                        </View>

                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() =>
                                    updateCartItem(item.product.id, item.quantity - 1, item.color)
                                }
                            >
                                <Text style={styles.quantityBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{item.quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityBtn}
                                onPress={() =>
                                    updateCartItem(item.product.id, item.quantity + 1, item.color)
                                }
                            >
                                <Text style={styles.quantityBtnText}>+</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => removeFromCart(item.product.id)}
                            >
                                <Text style={styles.deleteText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer với tổng tiền và nút thanh toán */}
            <View style={styles.footer}>
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    <Text style={styles.checkoutBtnText}>
                        {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                    </Text>
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
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 30,
    },
    continueShopping: {
        backgroundColor: '#d2a81fff',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    continueShoppingText: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    colorLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    price: {
        fontSize: 10,
        fontWeight: '700',
        color: '#f70a0aff',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    quantityBtn: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    quantity: {
        marginHorizontal: 8,
        fontWeight: '600',
        minWidth: 24,
        textAlign: 'center',
    },
    deleteBtn: {
        marginLeft: 12,
        padding: 4,
    },
    deleteText: {
        fontSize: 16,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f60a0aff',
    },
    checkoutBtn: {
        backgroundColor: '#e98a1eff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    checkoutBtnDisabled: {
        opacity: 0.6,
    },
    checkoutBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default CartScreen;
