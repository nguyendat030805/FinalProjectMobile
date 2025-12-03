import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const CartIconButton = ({ onPress }: { onPress: () => void }) => {
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Ionicons 
                name="cart-outline" // Icon giỏ hàng đơn giản (chỉ có đường viền)
                size={25}          // Kích thước icon
                color="#000000"    // Màu đen
            />
            {cartCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginRight: 19,
    },
    icon: {
        fontSize: 20,
    },
    badge: {
        position: 'absolute',
        right: -2,
        top: -1,
        backgroundColor: '#E91E63',
        borderRadius: 10,
        minWidth: 15,
        height: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 7,
        fontWeight: '700',
    },
});

export default CartIconButton;
