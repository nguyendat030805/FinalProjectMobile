import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen, { HomeStackParamList } from './HomeScreen';
import ProductDetailScreen from './screens/user/ProductDetailScreen';
import CategoriesScreen from './CategoriesScreen';
import CartScreen from './screens/user/CartScreen';
import CheckoutScreen from './screens/user/CheckoutScreen';
import OrderConfirmScreen from './screens/user/OrderConfirmScreen';
import OrderHistoryScreen from './screens/user/OrderHistoryScreen';
import CartIconButton from './components/CartIconButton';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
    return (
        <Stack.Navigator 
            screenOptions={({ navigation }) => ({
                headerShown: true,
                headerRight: () => (
                    <CartIconButton onPress={() => navigation.navigate('Cart')} />
                ),
                headerStyle: {
                    backgroundColor: '#383636ff',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
            initialRouteName="Home"
        >
            {/* --- PUBLIC SCREENS --- */}
            <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: '🏠 Trang chủ' }}
            />
            <Stack.Screen 
                name="Categories" 
                component={CategoriesScreen}
                options={{ title: '📂 Danh mục' }}
            />
            <Stack.Screen 
                name="ProductDetail" 
                component={ProductDetailScreen}
                options={{ title: '📦 Chi tiết sản phẩm' }}
            />
            
            {/* --- SHOPPING CART SCREENS --- */}
            <Stack.Screen 
                name="Cart" 
                component={CartScreen}
                options={{ title: '🛒 Giỏ hàng' }}
            />
            <Stack.Screen 
                name="Checkout" 
                component={CheckoutScreen}
                options={{ title: '📝 Thanh toán' }}
            />
            <Stack.Screen 
                name="OrderConfirm" 
                component={OrderConfirmScreen}
                options={{ title: '✅ Xác nhận đơn hàng' }}
            />
            
            {/* --- ORDER HISTORY --- */}
            <Stack.Screen 
                name="OrderHistory" 
                component={OrderHistoryScreen}
                options={{ title: '📋 Lịch sử đơn hàng' }}
            />
        </Stack.Navigator>
    );
};

export default HomeStackScreen;
