import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export const CartIconButton = ({ onPress }: { onPress: () => void }) => {
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.icon}>🛒</Text>
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
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: '#E91E63',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
});

export default CartIconButton;
