import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    View,
    Dimensions,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, fetchProducts, initDatabase } from '../database'; 
import { useCart } from '../context/CartContext';
import Header from '../components/Header'; 

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 8;
const TOTAL_MARGIN_HORIZONTAL = ITEM_MARGIN * (COLUMN_COUNT + 1);
const ITEM_WIDTH = (width - TOTAL_MARGIN_HORIZONTAL) / COLUMN_COUNT;

export type HomeStackParamList = {
    Home: undefined;
    ProductDetail: { product: Product };
    ProductsByCategory: undefined;
    Categories: undefined;
    AdminDashboard: undefined;
    Cart: undefined;
    Checkout: { cartItems: any };
    OrderConfirm: any;
    OrderHistory: undefined;
};

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const formatCurrency = (amount: number) =>
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 });

const imageAssets: { [key: string]: any } = {
    'hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg': require('../assets/hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg'),
    'Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg': require('../assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg'),
    'Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg': require('../assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'),
    'Hình-siêu-xe-cực-nét.jpg': require('../assets/Hình-siêu-xe-cực-nét.jpg'),
    'Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg': require('../assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg'),
    '1.jpg': require('../assets/1.jpg'),
    'Hình-siêu-xe-Lamborghini-scaled.jpg': require('../assets/Hình-siêu-xe-Lamborghini-scaled.jpg'),
    'Hình-ảnh-Siêu-xe-4k-scaled.jpg': require('../assets/Hình-ảnh-Siêu-xe-4k-scaled.jpg'),
    'Tải-hình-ảnh-siêu-xe-HD-cực-đẹp-về-máy.jpg': require('../assets/Tải-hình-ảnh-siêu-xe-HD-cực-đẹp-về-máy.jpg'),
    'Ảnh-siêu-xe-Lamborghini-Full-HD.jpg': require('../assets/Ảnh-siêu-xe-Lamborghini-Full-HD.jpg'),
    'Ảnh-siêu-xe-Lamborghini.jpg': require('../assets/Ảnh-siêu-xe-Lamborghini.jpg'),
};

const isUri = (str: string) => {
    return str.startsWith('http') || str.startsWith('file://') || str.startsWith('content://') || str.startsWith('asset://');
};

const getImageSource = (img: string) => {
    if (!img) {
        return require('../assets/26900.jpg');
    }
    

    if (isUri(img)) {
        return { uri: img };
    }
    

    const normalizedPath = img.replace(/\\/g, '/');
    const filename = normalizedPath.split('/').pop() || '';
    
    if (imageAssets[filename]) {
        return imageAssets[filename];
    }

    console.warn(`⚠️ Image not found in map: ${filename}. Original path: ${img}. Using fallback.`);
    return require('../assets/26900.jpg');
};
// ----------------------------------------------------------------------


const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedColor, setSelectedColor] = useState('Đỏ');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [showColorModal, setShowColorModal] = useState(false);
    const { addToCart } = useCart();

    const colors = ['Đỏ', 'Đen', 'Bạc', 'Xanh'];

    const loadData = async () => {
        setLoading(true);
        try {
            const prods = await fetchProducts();
            console.log('📦 Products loaded:', prods.length, 'products');
            // Log chi tiết để debug đường dẫn ảnh
            prods.forEach((p, i) => console.log(`  [${i}] ${p.name} - img: ${p.img}`));
            setProducts(prods.reverse());
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm từ DB:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async (product: Product) => {
        // Check if user is logged in
        try {
            const user = await AsyncStorage.getItem('loggedInUser');
            if (!user) {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập để mua hàng', [
                    { text: 'Đăng nhập', onPress: () => navigation.navigate('Home') },
                    { text: 'Hủy', style: 'cancel' },
                ]);
                return;
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }

        setSelectedProduct(product);
        setSelectedColor('Đỏ');
        setSelectedQuantity(1);
        setShowColorModal(true);
    };

    const handleConfirmPurchase = () => {
        if (selectedProduct) {
            addToCart(selectedProduct, selectedQuantity, selectedColor);
            setShowColorModal(false);
            Alert.alert(
                'Thành công',
                `Đã thêm ${selectedQuantity} chiếc ${selectedProduct.name} (Màu ${selectedColor}) vào giỏ hàng`,
                [
                    { text: 'Tiếp tục mua', style: 'cancel' },
                    { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
                ]
            );
        }
    };

    useEffect(() => {
        initDatabase(() => loadData());
    }, []);

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
             style={styles.maincontainer}
        >
            <View style={styles.productCard}>
                <Image 
                    source={getImageSource(item.img)} 
                    style={styles.image}
                />
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleBuyNow(item);
                    }}
                >
                    <Text style={styles.buyButtonText}>Mua Ngay</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const HeaderComponent = () => (
        <>
            <Image
                source={require('../assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg')}
                style={styles.banner}
            />
            
            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.menuText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Categories')}>
                    <Text style={styles.menuText}>Danh mục</Text>
                </TouchableOpacity>
            </View>
            {/* Component Header của bạn - thường dùng cho Thanh điều hướng trên cùng */}
            <Header/> 
            <Text style={styles.welcomeText}>Chào mừng đến với cửa hàng Siêu xe</Text>
        </>
    );

    return (
        <>
            {/* Hiển thị Loading */}
            {loading && products.length === 0 ? (
                <View style={[styles.fullScreenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#E91E63" />
                </View>
            ) : (
                // FlatList hiển thị sản phẩm
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.flatListContent}
                    ListHeaderComponent={<HeaderComponent />}
                    ListEmptyComponent={
                        <View style={{ paddingTop: 50 }}>
                            <Text style={styles.emptyListText}>🏎️ Không có sản phẩm nào</Text>
                        </View>
                    }
                />
            )}

            {/* Modal Chọn Màu Sắc/Số lượng */}
            <Modal
                visible={showColorModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowColorModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedProduct?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setShowColorModal(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Color Selection */}
                            <View style={styles.selectionSection}>
                                <Text style={styles.selectionLabel}>Chọn màu sắc</Text>
                                <View style={styles.colorGrid}>
                                    {colors.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                selectedColor === color && styles.colorOptionSelected,
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            <View
                                                style={[
                                                    styles.colorCircle,
                                                    {
                                                        backgroundColor:
                                                            color === 'Đỏ'
                                                                ? '#E91E63'
                                                                : color === 'Đen'
                                                                    ? '#1a1a1a'
                                                                    : color === 'Bạc'
                                                                        ? '#C0C0C0'
                                                                        : '#1E88E5',
                                                    },
                                                ]}
                                            />
                                            <Text style={styles.colorName}>{color}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Quantity Selection */}
                            <View style={styles.selectionSection}>
                                <Text style={styles.selectionLabel}>Số lượng</Text>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity
                                        style={styles.quantityBtn}
                                        onPress={() =>
                                            setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                                        }
                                    >
                                        <Text style={styles.quantityBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityValue}>{selectedQuantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityBtn}
                                        onPress={() => setSelectedQuantity(selectedQuantity + 1)}
                                    >
                                        <Text style={styles.quantityBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Price Summary */}
                            <View style={styles.priceSummary}>
                                <Text style={styles.priceLabel}>Giá tiền</Text>
                                <Text style={styles.priceValue}>
                                    {(
                                        (selectedProduct?.price || 0) * selectedQuantity
                                    ).toLocaleString('vi-VN')}{' '}
                                    đ
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelModalBtn}
                                onPress={() => setShowColorModal(false)}
                            >
                                <Text style={styles.cancelModalBtnText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmModalBtn}
                                onPress={handleConfirmPurchase}
                            >
                                <Text style={styles.confirmModalBtnText}>Thêm vào giỏ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};


const styles = StyleSheet.create({
    fullScreenContainer: { 
        flex: 1, 
        backgroundColor: '#6d6a6aff', 
    },
    flatListContent: { 
        paddingHorizontal: ITEM_MARGIN / 2, 
        paddingBottom: 20,
    },
    maincontainer:{
        flex:1,
        justifyContent: 'space-between', 
        margin: ITEM_MARGIN / 2,
    },


    banner: { 
        width: '100%', 
        height: 180, 
        resizeMode: 'cover', 
        borderBottomLeftRadius: 15, 
        borderBottomRightRadius: 15,
        marginBottom: 15,
    },
    menuContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingVertical: 12, 
        marginHorizontal: 15, 
        backgroundColor: '#ffffffff', 
        borderRadius: 12, 
        elevation: 8, 
        marginTop: -30, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#00000050', 
    },
    menuItem: {
        paddingHorizontal: 10,
    },
    menuText: { 
        fontSize: 13, 
        fontWeight: '500', 
        color: '#040404ff', 
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    welcomeText: { 
        textAlign: 'center', 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#100b0bff', 
        marginVertical: 15,
        letterSpacing: 0.5,
    },
    productCard: { 
        flex: 1, 
        backgroundColor: '#ffffffff', 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingBottom: 10, 
        elevation: 6, 
        borderWidth: 1,
        borderColor: '#3a3a3a', 
        
    },
    image: { 
        width: '100%', 
        height: ITEM_WIDTH * 0.9, 
        resizeMode: 'cover', 
        borderTopLeftRadius: 10, 
        borderTopRightRadius: 10, 
        marginBottom: 8,
    },
    productName: { 
        fontSize: 14, 
        fontWeight: '400', 
        color: '#000000ff', 
        textAlign: 'center', 
        marginBottom: 5,
    },
    productPrice: { 
        fontSize: 16, 
        color: '#fb0202ff', 
        marginBottom: 10,
    },
    
    buyButton: { 
        backgroundColor: '#e9981fff', 
        width: '70%', 
        paddingVertical: 10, 
        borderRadius: 6, 
        alignItems: 'center',
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buyButtonText: { 
        color: '#fff', 
        fontWeight: '500', 
        fontSize: 10, 
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    
    // --- Empty List ---
    emptyListText: { 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 16, 
        color: '#AAAAAA', 
    },

    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        flex: 1,
    },
    closeBtn: {
        fontSize: 24,
        color: '#999',
        padding: 8,
    },
    modalBody: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    selectionSection: {
        marginBottom: 20,
    },
    selectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        flex: 1,
        minWidth: '33%',
        borderRadius: 12,
        padding: 5,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
    },
    colorOptionSelected: {
        borderColor: '#e9b31eff',
        backgroundColor: '#fefefeff',
    },
    colorCircle: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    colorName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 10,
    },
    quantityBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#f3cb03ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityValue: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    priceSummary: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        padding: 10,
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ff0000ff',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    cancelModalBtn: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelModalBtnText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    confirmModalBtn: {
        flex: 1,
        backgroundColor: '#f1a211ff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmModalBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default HomeScreen;