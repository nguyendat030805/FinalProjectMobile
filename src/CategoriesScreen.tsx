import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator,
    ListRenderItem,
    Image,
    SafeAreaView,
    RefreshControl,
    TextInput,
} from 'react-native';

// Import các kiểu dữ liệu và hàm từ file database services của bạn
import { 
    Category, 
    Product, 
    fetchCategories, 
    fetchProductsByCategoryId,
    searchProductsAdvanced, // <<-- Hàm tìm kiếm nâng cao
} from './database'; // Đảm bảo đường dẫn này chính xác

// --- 1. Ánh xạ ảnh tĩnh (Cần phải sao chép từ HomeScreen.tsx để tránh lỗi Reference) ---
// Giả định rằng bạn có các ảnh này trong thư mục ./assets/
const imageAssets: { [key: string]: any } = {
    'hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg': require('./assets/hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg'),
    'Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg': require('./assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg'),
    'Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg': require('./assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'),
    'Hình-siêu-xe-cực-nét.jpg': require('./assets/Hình-siêu-xe-cực-nét.jpg'),
    'Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg': require('./assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg'),
    '1.jpg': require('./assets/1.jpg'),
    'Hình-siêu-xe-Lamborghini-scaled.jpg': require('./assets/Hình-siêu-xe-Lamborghini-scaled.jpg'),
    'Hình-ảnh-Siêu-xe-4k-scaled.jpg': require('./assets/Hình-ảnh-Siêu-xe-4k-scaled.jpg'),
    'Tải-hình-ảnh-siêu-xe-HD-cực-đẹp-về-máy.jpg': require('./assets/Tải-hình-ảnh-siêu-xe-HD-cực-đẹp-về-máy.jpg'),
    'Ảnh-siêu-xe-Lamborghini-Full-HD.jpg': require('./assets/Ảnh-siêu-xe-Lamborghini-Full-HD.jpg'),
    'Ảnh-siêu-xe-Lamborghini.jpg': require('./assets/Ảnh-siêu-xe-Lamborghini.jpg'),
    // Thêm các ảnh mặc định/fallback nếu cần
    '26900.jpg': require('./assets/26900.jpg'), 
    '2161748.jpg': require('./assets/2161748.jpg'), 
    // Nếu bạn đang dùng logic tên file từ database.tsx đã sửa, thì không cần tiền tố ./assets/
};

// --- 2. Hàm lấy nguồn ảnh (FIX: Lấy từ tên file) ---
const getImageSource = (img: string) => {
    // 1. Chuẩn hóa & trích xuất filename
    const normalizedPath = img.replace(/\\/g, '/');
    const filename = normalizedPath.split('/').pop() || '';
    
    // 2. Tra cứu trong map
    if (imageAssets[filename]) {
        return imageAssets[filename];
    }

    console.warn(`⚠️ Image not found in map for CategorySelector: ${filename}`);
    
    // Fallback mặc định
    return require('./assets/Hình-siêu-xe-cực-nét.jpg');
};


// --- Component chính ---
const CategorySelector = () => {
    // State cho danh sách danh mục
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    
    // --- State cho Tìm kiếm & Lọc Giá ---
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Sử dụng state này để theo dõi xem có đang áp dụng bộ lọc/tìm kiếm nào không
    const isSearching = searchTerm.length > 0 || minPrice.length > 0 || maxPrice.length > 0;

    // --- 1. Hàm tải Danh mục (Chỉ gọi một lần) ---
    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        if (data.length > 0 && selectedCategoryId === null) {
            setSelectedCategoryId(data[0].id);
        }
        setIsLoading(false);
    }, [selectedCategoryId]);

    // --- 2. Hàm tải Sản phẩm dựa trên bộ lọc hiện tại ---
    const loadProducts = useCallback(async (currentCategoryId: number | null, isSearchingMode: boolean) => {
        // Nếu đã có dữ liệu, chỉ hiện loading khi Refresh
        if (products.length === 0) setIsLoading(true); 
        
        try {
            let data: Product[] = [];
            
            // Nếu có bất kỳ bộ lọc nào (tìm kiếm/giá), sử dụng hàm tìm kiếm nâng cao
            if (isSearchingMode) {
                // Chuyển đổi giá trị TextInput sang số, nếu không hợp lệ thì là undefined
                const parsedMinPrice = minPrice ? parseFloat(minPrice.replace(/,/g, '')) : undefined;
                const parsedMaxPrice = maxPrice ? parseFloat(maxPrice.replace(/,/g, '')) : undefined;
                
                // Kiểm tra nếu min > max
                if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
                    // Có thể thêm Alert ở đây, nhưng tạm thời chỉ log lỗi
                    console.warn('Min price is greater than Max price. Filtering may be incorrect.');
                }
                
                data = await searchProductsAdvanced(searchTerm, parsedMinPrice, parsedMaxPrice);
                
            } else if (currentCategoryId !== null) {
                // Nếu không tìm kiếm, lọc theo Category ID đã chọn
                data = await fetchProductsByCategoryId(currentCategoryId); 
            }
            
            setProducts(data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [searchTerm, minPrice, maxPrice, products.length]); 


    // --- Effects ---
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Effect: Khi Category ID thay đổi VÀ KHÔNG TRONG CHẾ ĐIỆN TÌM KIẾM, tải sản phẩm theo danh mục.
    useEffect(() => {
        // Khi Category ID thay đổi, chỉ tải sản phẩm theo category nếu KHÔNG có bộ lọc tìm kiếm
        if (!isSearching && selectedCategoryId !== null) {
            loadProducts(selectedCategoryId, false);
        }
        // Khi người dùng xóa hết bộ lọc, quay về tải sản phẩm theo selectedCategoryId
        if (selectedCategoryId !== null && !isSearching) {
             loadProducts(selectedCategoryId, false);
        }
    }, [selectedCategoryId, isSearching, loadProducts]);
    
    // Effect: Khi bộ lọc (tìm kiếm/giá) thay đổi, tải sản phẩm theo bộ lọc.
    useEffect(() => {
        // Chỉ chạy nếu đang trong chế độ tìm kiếm
        if (isSearching) {
            // Debounce để tránh gọi API liên tục khi người dùng gõ
            const handler = setTimeout(() => {
                // Sử dụng null cho categoryId khi tìm kiếm nâng cao (lọc qua tất cả)
                loadProducts(null, true);
            }, 500); // Đợi 500ms sau khi ngừng gõ/thay đổi giá

            return () => clearTimeout(handler);
        }
    }, [isSearching, searchTerm, minPrice, maxPrice, loadProducts]);


    // Xử lý Pull to Refresh (Tải lại sản phẩm dựa trên trạng thái lọc hiện tại)
    const onRefresh = () => {
        setIsRefreshing(true);
        if (isSearching) {
            loadProducts(null, true);
        } else if (selectedCategoryId !== null) {
            loadProducts(selectedCategoryId, false);
        } else {
            // Trường hợp refresh khi chưa có category nào được chọn
            loadCategories(); 
        }
    };
    
    // Khi chọn danh mục, nếu đang tìm kiếm thì xóa tìm kiếm
    const handleCategorySelect = (id: number) => {
        if (isSearching) {
            setSearchTerm('');
            setMinPrice('');
            setMaxPrice('');
        }
        setSelectedCategoryId(id);
    };

    // --- Render Item cho Danh mục ---
    const renderCategoryButton: ListRenderItem<Category> = ({ item }) => {
        // Category button không được chọn nếu đang ở chế độ tìm kiếm
        const isSelected = item.id === selectedCategoryId && !isSearching; 
        return (
            <TouchableOpacity
                style={[styles.categoryButton, isSelected && styles.selectedCategoryButton]}
                onPress={() => handleCategorySelect(item.id)} 
            >
                <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    // --- Render Item cho Sản phẩm ---
    const renderProductItem: ListRenderItem<Product> = ({ item }) => (
        <View style={styles.productItem}>
            <Image 
                source={item.img ? getImageSource(item.img) : require('./assets/Hình-siêu-xe-cực-nét.jpg')} 
                style={styles.productImage} 
                resizeMode="cover"
            />
            <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')} USD</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>🏎️ Danh Mục Siêu Xe</Text>
            
            {/* --- Phần Tìm kiếm và Lọc Giá --- */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm theo tên/danh mục..."
                    placeholderTextColor="#999"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <View style={styles.priceFilterContainer}>
                    <TextInput
                        style={[styles.priceInput, {marginRight: 8}]}
                        placeholder="Giá Min (USD)"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                    />
                    <TextInput
                        style={styles.priceInput}
                        placeholder="Giá Max (USD)"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                    />
                </View>
            </View>
            {/* --------------------------------- */}

            {/* Thanh cuộn ngang cho Danh mục */}
            <FlatList
                data={categories}
                renderItem={renderCategoryButton}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
                contentContainerStyle={styles.categoryListContent}
            />

            {/* Hiển thị Sản phẩm */}
            <View style={styles.productContainer}>
                <Text style={styles.subHeaderTitle}>
                    {isSearching 
                        ? `Kết quả tìm kiếm (${products.length})` 
                        : `Sản phẩm: ${categories.find(c => c.id === selectedCategoryId)?.name || 'Tất cả'}`
                    }
                </Text>
                
                {isLoading && !isRefreshing && products.length === 0 ? (
                    <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
                ) : products.length > 0 ? (
                    <FlatList
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        numColumns={2} // Hiển thị 2 cột
                        columnWrapperStyle={styles.row}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                        }
                    />
                ) : (
                    <Text style={styles.noDataText}>Không tìm thấy sản phẩm nào.</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginHorizontal: 15,
        marginVertical: 10,
        color: '#333',
        textAlign: 'center',
    },
    
    // --- Search & Filter Styles ---
    searchContainer: {
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    priceFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        // Đã loại bỏ marginHorizontal trong priceInput và dùng marginRight/marginLeft để kiểm soát khoảng cách
    },
    // --- Category List Styles ---
    categoryList: {
        maxHeight: 60,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryListContent: {
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedCategoryButton: {
        backgroundColor: '#3498db', // Màu xanh dương khi chọn
        borderColor: '#3498db',
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    selectedCategoryText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    // --- Product List Styles ---
    productContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    subHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
        marginTop: 5,
        color: '#555',
        marginLeft: 5,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    productItem: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        minHeight: 200, // Đảm bảo chiều cao tối thiểu
    },
    productImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    productDetails: {
        padding: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#e74c3c', // Màu đỏ cho giá
    },
    loadingIndicator: {
        marginTop: 50,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999',
    },
});

export default CategorySelector;