import React, { createContext, useContext, useState } from 'react';
import { Product } from '../database';

export type CartItem = {
    product: Product;
    quantity: number;
    color: string;
    totalPrice: number;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity: number, color: string) => void;
    removeFromCart: (productId: number) => void;
    updateCartItem: (productId: number, quantity: number, color: string) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number, color: string) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => item.product.id === product.id && item.color === color
            );

            if (existingItem) {
                return prevItems.map((item) =>
                    item.product.id === product.id && item.color === color
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            totalPrice: (item.quantity + quantity) * product.price,
                        }
                        : item
                );
            }

            return [
                ...prevItems,
                {
                    product,
                    quantity,
                    color,
                    totalPrice: quantity * product.price,
                },
            ];
        });
    };

    const removeFromCart = (productId: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    };

    const updateCartItem = (productId: number, quantity: number, color: string) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.product.id === productId
                    ? {
                        ...item,
                        quantity: Math.max(1, quantity),
                        color,
                        totalPrice: Math.max(1, quantity) * item.product.price,
                    }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateCartItem,
                clearCart,
                getTotalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
