import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredOrder = {
    id: string;
    orderId: string;
    totalAmount: number;
    deliveryAddress: string;
    phone: string;
    deliveryMethod: string;
    paymentMethod: string;
    orderDate: string;
    status: string;
    items?: any[];
};

/**
 * Lưu một đơn hàng mới vào AsyncStorage dưới khóa của người dùng.
 */
export const saveOrder = async (orderId: string, orderData: any, username: string, items?: any[]) => {
    try {
        const storageKey = `orders_${username}`;
        const existingOrdersStr = await AsyncStorage.getItem(storageKey);
        
        let orders: StoredOrder[] = [];
        if (existingOrdersStr) {
            orders = JSON.parse(existingOrdersStr);
        }

        const newOrder: StoredOrder = {
            id: orderId,
            orderId: orderId,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            phone: orderData.phone,
            deliveryMethod: orderData.deliveryMethod,
            paymentMethod: orderData.paymentMethod,
            // Gợi ý: Lưu dưới dạng ISO String nếu orderData.orderDate chưa phải là string
            orderDate: orderData.orderDate, 
            status: orderData.status,
            items: items || [],
        };

        orders.unshift(newOrder); // Thêm vào đầu danh sách
        await AsyncStorage.setItem(storageKey, JSON.stringify(orders));
        
        return true;
    } catch (error) {
        console.error('Error saving order:', error);
        return false;
    }
};

/**
 * Lấy tất cả đơn hàng đã lưu của một người dùng.
 */
export const getOrders = async (username: string): Promise<StoredOrder[]> => {
    try {
        const storageKey = `orders_${username}`;
        const ordersStr = await AsyncStorage.getItem(storageKey);
        
        if (ordersStr) {
            return JSON.parse(ordersStr);
        }
        return [];
    } catch (error) {
        console.error('Error getting orders:', error);
        return [];
    }
};

/**
 * Cập nhật trạng thái của một đơn hàng cụ thể.
 */
export const updateOrderStatus = async (username: string, orderId: string, newStatus: string): Promise<boolean> => {
    try {
        const storageKey = `orders_${username}`;
        const ordersStr = await AsyncStorage.getItem(storageKey);
        
        if (!ordersStr) {
            return false;
        }

        let orders: StoredOrder[] = JSON.parse(ordersStr);
        const orderIndex = orders.findIndex(o => o.orderId === orderId);

        if (orderIndex === -1) {
            console.warn(`Order ID ${orderId} not found for user ${username}.`);
            return false;
        }

        // Cập nhật trạng thái
        orders[orderIndex].status = newStatus;

        await AsyncStorage.setItem(storageKey, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
};