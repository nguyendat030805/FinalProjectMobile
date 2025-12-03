import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../HomeScreen';
import { getImageSource } from '../../database';
type OrderConfirmScreenProps = NativeStackScreenProps<HomeStackParamList, 'OrderConfirm'>;

const OrderConfirmScreen = ({ navigation, route }: OrderConfirmScreenProps) => {
    const { orderId, orderData, cartItems, totalPrice } = route.params;

    const handleBackHome = () => {
        navigation.navigate('Home');
    };

    const handleViewOrders = () => {
        // Navigate to Orders screen
        navigation.navigate('OrderHistory');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.successSection}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.successIcon}>✅</Text>
                    </View>
                    <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
                    <Text style={styles.successSubtitle}>Cảm ơn bạn đã mua sắm tại CarShop</Text>
                </View>

                {/* Order ID */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Mã đơn hàng</Text>
                    <View style={styles.orderIdBox}>
                        <Text style={styles.orderId}>{orderId}</Text>
                        <TouchableOpacity style={styles.copyBtn}>
                            <Text style={styles.copyBtnText}>Sao chép</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Date */}
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📅 Ngày đặt:</Text>
                        <Text style={styles.infoValue}>
                            {new Date(orderData.orderDate).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Sản phẩm trong đơn</Text>
                    <View style={styles.itemsBox}>
                        {cartItems.map((item: any, index: number) => (
                            <View
                                key={`${item.product.id}-${index}`}
                                style={[
                                    styles.itemRow,
                                    index !== cartItems.length - 1 && styles.itemRowBorder,
                                ]}
                            >
                                <Image
                                    source={getImageSource(item.product.img)}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.product.name}
                                    </Text>
                                    <Text style={styles.itemDetails}>
                                        Màu: {item.color} | SL: {item.quantity}
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    {item.totalPrice.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Thông tin giao hàng</Text>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Địa chỉ:</Text>
                            <Text style={[styles.infoValue, styles.addressText]}>
                                {orderData.deliveryAddress}
                            </Text>
                        </View>
                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <Text style={styles.infoLabel}>Số điện thoại:</Text>
                            <Text style={styles.infoValue}>{orderData.phone}</Text>
                        </View>
                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <Text style={styles.infoLabel}>Phương thức:</Text>
                            <Text style={styles.infoValue}>
                                {orderData.deliveryMethod === 'express'
                                    ? 'Nhanh hôm nay'
                                    : 'Tiêu chuẩn'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Thông tin thanh toán</Text>
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phương thức:</Text>
                            <Text style={styles.infoValue}>
                                {orderData.paymentMethod === 'credit_card'
                                    ? 'Thẻ tín dụng'
                                    : orderData.paymentMethod === 'bank_transfer'
                                      ? 'Chuyển khoản'
                                      : 'Thanh toán khi nhận'}
                            </Text>
                        </View>
                        <View style={[styles.infoRow, styles.infoRowBorder]}>
                            <Text style={styles.infoLabel}>Trạng thái:</Text>
                            <Text style={[styles.infoValue, styles.pendingStatus]}>
                                ⏳ Đang xử lý
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Price Summary */}
                <View style={styles.priceSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
                        <Text style={styles.summaryValue}>
                            {(totalPrice - (orderData.deliveryMethod === 'express' ? 50000 : 20000)).toLocaleString(
                                'vi-VN'
                            )}
                            đ
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
                        <Text style={styles.summaryValue}>
                            {(orderData.deliveryMethod === 'express' ? 50000 : 20000).toLocaleString(
                                'vi-VN'
                            )}
                            đ
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>TỔNG CỘNG:</Text>
                        <Text style={styles.totalAmount}>
                            {totalPrice.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                </View>

                {/* Important Note */}
                <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>📌 Lưu ý quan trọng</Text>
                    <Text style={styles.noteText}>
                        • Đơn hàng của bạn đang được xử lý. Bạn sẽ nhận được SMS xác nhận trong vòng 15 phút.
                    </Text>
                    <Text style={styles.noteText}>
                        • Thời gian giao hàng dự kiến: 1-2 ngày làm việc
                    </Text>
                    <Text style={styles.noteText}>
                        • Kiểm tra email hoặc ứng dụng để cập nhật trạng thái đơn hàng
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.orderBtn} onPress={handleViewOrders}>
                    <Text style={styles.orderBtnText}>Lịch sử đơn hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeBtn} onPress={handleBackHome}>
                    <Text style={styles.homeBtnText}>Về trang chủ</Text>
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
    content: {
        flex: 1,
        padding: 16,
    },
    successSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 16,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successIcon: {
        fontSize: 40,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#27AE60',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    orderIdBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#080707ff',
        letterSpacing: 1,
    },
    copyBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    copyBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoRowBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    addressText: {
        maxWidth: 200,
    },
    itemsBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemRow: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    itemRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 11,
        color: '#999',
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: '#f61010ff',
        marginLeft: 8,
    },
    infoBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pendingStatus: {
        color: '#FF9800',
    },
    priceSummary: {
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
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    totalRow: {
        borderBottomWidth: 2,
        borderBottomColor: '#e98a1eff',
        paddingVertical: 12,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f50d0dff',
    },
    noteBox: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
        marginBottom: 20,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF9800',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
        marginBottom: 6,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderBtn: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    orderBtnText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    homeBtn: {
        backgroundColor: '#e9911eff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    homeBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default OrderConfirmScreen;
