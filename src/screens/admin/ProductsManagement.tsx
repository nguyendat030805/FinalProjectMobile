import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
    Modal,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker'; // 👈 Bổ sung thư viện chọn ảnh

// CHÚ Ý ĐƯỜNG DẪN IMPORT TỚI database.ts
import {
    fetchProducts,
    fetchCategories,
    addProduct,
    updateProduct as updateDbProduct,
    deleteProduct as deleteDbProduct,
    Product,
    Category,
    resetAndInitDatabase,
    getImageSource, // <--- Đã được cập nhật để xử lý URI/URL/Tên file
} from '../../database'; 

// --- TYPE MỚI CHO LỰA CHỌN NGUỒN ẢNH ---
type ImageSourceOption = 'filename' | 'url' | 'library';

const ProductsManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // --- STATE ĐỂ LƯU THÔNG TIN INPUT ---
    const [productName, setProductName] = useState<string>('');
    const [productPrice, setProductPrice] = useState<string>('');
    const [productImg, setProductImg] = useState<string>(''); // Lưu Tên file / URL / URI
    const [productCategoryId, setProductCategoryId] = useState<string>('1');
    
    // --- STATE MỚI CHO CHỌN ẢNH ---
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [imageSourceOption, setImageSourceOption] = useState<ImageSourceOption>('filename');
    const [selectedImageUri, setSelectedImageUri] = useState<string>(''); // Lưu URI tạm thời từ thư viện

    useEffect(() => {
        const initializeData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await loadData();
            // Yêu cầu quyền truy cập thư viện ảnh ngay khi khởi động
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        };
        initializeData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([fetchProducts(), fetchCategories()]);
            setProducts(productsData);
            setCategories(categoriesData);
            if (categoriesData.length > 0) {
                setProductCategoryId(categoriesData[0].id.toString()); 
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProductName('');
        setProductPrice('');
        setProductImg('');
        setProductCategoryId(categories[0]?.id.toString() || '1'); 
        setEditingProduct(null);
        // Reset trạng thái chọn ảnh
        setImageSourceOption('filename'); 
        setSelectedImageUri('');
    };
    
    // --- HÀM XỬ LÝ CHỌN ẢNH TỪ THƯ VIỆN ---
    const pickImage = async () => {
        // Kiểm tra quyền
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi quyền', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            // Không cần Base64, chỉ cần URI là đủ để hiển thị và lưu tạm
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            // Lưu URI vào state tạm thời. Nó sẽ được gán vào productImg khi lưu.
            setSelectedImageUri(uri); 
            setProductImg(uri); // Cập nhật productImg ngay lập tức (dùng cho hiển thị preview)
            Alert.alert('Thành công', 'Đã chọn ảnh từ thư viện.');
        } else {
             // Nếu người dùng hủy chọn ảnh, chuyển lại về lựa chọn "Tên file"
             if (!productImg && !editingProduct) {
                setImageSourceOption('filename');
             }
        }
    };

    // --- HÀM LƯU SẢN PHẨM (ĐÃ ĐƯỢC CẬP NHẬT LOGIC NGUỒN ẢNH) ---
    const handleSaveProduct = async () => {
        let finalImgSource = productImg.trim();

        // 1. Kiểm tra đầu vào cơ bản
        if (!productName.trim() || !productPrice.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền tên và giá');
            return;
        }
        
        // 2. Xử lý nguồn ảnh tùy theo lựa chọn
        if (imageSourceOption === 'library') {
            if (!selectedImageUri) {
                 Alert.alert('Lỗi', 'Vui lòng chọn ảnh từ thư viện.');
                 return;
            }
            finalImgSource = selectedImageUri; // Gán URI cục bộ
        } else if (!finalImgSource) {
            // Kiểm tra trường hợp Filename hoặc URL rỗng
            Alert.alert('Lỗi', 'Vui lòng nhập Tên file hoặc Link ảnh.');
            return;
        }


        const price = parseFloat(productPrice);
        if (isNaN(price) || price < 0) {
             Alert.alert('Lỗi', 'Giá không hợp lệ');
            return;
        }

        try {
            const categoryId = parseInt(productCategoryId);

            const productDataToSave: Omit<Product, 'id'> = {
                name: productName,
                price,
                img: finalImgSource, // Chuỗi có thể là Tên file, URL, hoặc URI
                categoryId
            };

            if (editingProduct) {
                await updateDbProduct({
                    ...productDataToSave,
                    id: editingProduct.id,
                } as Product);
                Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
            } else {
                await addProduct(productDataToSave);
                Alert.alert('Thành công', 'Thêm sản phẩm thành công');
            }
            await loadData();
            resetForm();
            setShowModal(false);
        } catch(e) {
            console.error("Lỗi khi lưu sản phẩm:", e);
            Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
        }
    };

    // ... (Các hàm khác: handleDeleteProduct, handleEditProduct, getCategoryName, loading check)
    const handleDeleteProduct = (id: number, name: string) => {
        Alert.alert('Xác nhận Xóa', `Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDbProduct(id);
                        setProducts(products.filter(prod => prod.id !== id));
                        Alert.alert('Thành công', 'Xóa sản phẩm thành công');
                    } catch {
                        Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
                    }
                }
            }
        ]);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductName(product.name);
        setProductPrice(product.price.toString());
        setProductImg(product.img);
        setProductCategoryId(product.categoryId.toString());
        setShowModal(true);

        // Xác định nguồn ảnh hiện tại khi vào chế độ sửa
        if (product.img.startsWith('http')) {
            setImageSourceOption('url');
            setSelectedImageUri('');
        } else if (product.img.startsWith('file://') || product.img.startsWith('content://')) {
            setImageSourceOption('library');
            setSelectedImageUri(product.img);
        } else {
            setImageSourceOption('filename');
            setSelectedImageUri('');
        }
    };

    const getCategoryName = (categoryId: number) =>
        categories.find(cat => cat.id === categoryId)?.name || 'N/A';

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#2D6CDF" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Header và List */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.appTitle}>Quản lý Sản phẩm</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.outlineButton, styles.dangerOutline]}
                            onPress={() => {
                                Alert.alert(
                                    'Xác nhận',
                                    'Bạn có chắc muốn reset database? Tất cả dữ liệu sẽ mất!',
                                    [
                                        { text: 'Hủy', style: 'cancel' },
                                        {
                                            text: 'Reset',
                                            style: 'destructive',
                                            onPress: async () => {
                                                await resetAndInitDatabase();
                                                await loadData();
                                                Alert.alert('✅ Done', 'Database đã được reset và load lại dữ liệu mẫu');
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={[styles.outlineButtonText, styles.dangerOutlineText]}>Reset DB</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            <Text style={styles.primaryButtonText}>➕ Thêm</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Danh sách Sản phẩm ({products.length})</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
                    {products.length === 0 && (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
                            <Text style={styles.emptySubtitle}>
                                Hãy thêm sản phẩm mới để bắt đầu quản lý danh mục của bạn.
                            </Text>
                        </View>
                    )}

                    {products.map(product => (
                        <View key={product.id} style={styles.card}>
                            {/* SỬ DỤNG getImageSource() - Xử lý 3 loại nguồn ảnh */}
                            <Image 
                                source={getImageSource(product.img)} 
                                style={styles.cardImage} 
                            />
                            <View style={styles.cardInfo}>
                                <Text numberOfLines={1} style={styles.cardName}>
                                    {product.name}
                                </Text>
                                <Text style={styles.cardPrice}>
                                    {product.price.toLocaleString('vi-VN')} đ
                                </Text>
                                <Text style={styles.cardMeta}>
                                    Danh mục: <Text style={styles.cardMetaBold}>{getCategoryName(product.categoryId)}</Text>
                                </Text>
                                <Text style={styles.cardId}>ID: {product.id}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.secondaryButton} onPress={() => handleEditProduct(product)}>
                                    <Text style={styles.secondaryButtonText}>Sửa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.dangerButton}
                                    onPress={() => handleDeleteProduct(product.id, product.name)}
                                >
                                    <Text style={styles.dangerButtonText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Modal bottom sheet (Phần đã được cập nhật) */}
                <Modal
                    visible={showModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => {
                        setShowModal(false);
                        resetForm();
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.sheet}>
                            <View style={styles.sheetHandle} />
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>
                                    {editingProduct ? `Sửa sản phẩm: ${editingProduct.name}` : 'Thêm sản phẩm mới'}
                                </Text>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.iconButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Tên sản phẩm</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: Lamborghini Revuelto"
                                value={productName}
                                onChangeText={setProductName}
                            />

                            <Text style={styles.label}>Giá (USD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: 125000"
                                value={productPrice}
                                onChangeText={setProductPrice}
                                keyboardType="decimal-pad"
                            />

                            {/* --- NGUỒN ẢNH SEGMENTED CONTROL --- */}
                            <Text style={styles.label}>Nguồn ảnh</Text>
                            <View style={styles.segmentedControl}>
                                <TouchableOpacity
                                    style={[styles.segment, imageSourceOption === 'filename' && styles.segmentSelected]}
                                    onPress={() => {
                                        setImageSourceOption('filename');
                                        setProductImg(''); 
                                        setSelectedImageUri('');
                                    }}
                                >
                                    <Text style={[styles.segmentText, imageSourceOption === 'filename' && styles.segmentTextSelected]}>Tên file (Assets)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.segment, imageSourceOption === 'url' && styles.segmentSelected]}
                                    onPress={() => {
                                        setImageSourceOption('url');
                                        setProductImg(''); 
                                        setSelectedImageUri('');
                                    }}
                                >
                                    <Text style={[styles.segmentText, imageSourceOption === 'url' && styles.segmentTextSelected]}>Link (URL)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.segment, imageSourceOption === 'library' && styles.segmentSelected]}
                                    onPress={() => {
                                        setImageSourceOption('library');
                                        setProductImg(''); 
                                        // Tự động mở thư viện, hàm pickImage sẽ cập nhật selectedImageUri
                                        pickImage(); 
                                    }}
                                >
                                    <Text style={[styles.segmentText, imageSourceOption === 'library' && styles.segmentTextSelected]}>Thư viện</Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- VÙNG NHẬP LIỆU TÙY CHỌN --- */}
                            {imageSourceOption === 'filename' && (
                                <>
                                    <Text style={styles.label}>Tên file ảnh (Ví dụ: 1.jpg)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ví dụ: 1.jpg"
                                        value={productImg}
                                        onChangeText={setProductImg}
                                    />
                                </>
                            )}

                            {imageSourceOption === 'url' && (
                                <>
                                    <Text style={styles.label}>Link ảnh (URL)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ví dụ: https://linkanh.com/sp1.png"
                                        value={productImg}
                                        onChangeText={setProductImg}
                                        keyboardType="url"
                                    />
                                </>
                            )}

                            {imageSourceOption === 'library' && (
                                <>
                                    <Text style={styles.label}>Ảnh đã chọn</Text>
                                    {(selectedImageUri || (editingProduct && editingProduct.img.startsWith('file'))) ? (
                                        <Image 
                                            source={{ uri: selectedImageUri || editingProduct?.img }} 
                                            style={styles.previewImage} 
                                        />
                                    ) : (
                                        <TouchableOpacity 
                                            style={styles.libraryButton} 
                                            onPress={pickImage}
                                        >
                                            <Text style={styles.libraryButtonText}>Chọn ảnh từ thư viện</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                            
                            {/* --- SELECT CATEGORY --- */}
                            <Text style={styles.label}>Danh mục</Text>
                            <View style={styles.pickerWrap}>
                                <Picker 
                                    selectedValue={productCategoryId} 
                                    onValueChange={setProductCategoryId} 
                                    style={styles.picker}
                                >
                                    {categories.map(cat => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                                    ))}
                                </Picker>
                            </View>

                            {/* --- NÚT LƯU --- */}
                            <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProduct}>
                                <Text style={styles.primaryButtonText}>
                                    {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                                </Text>
                            </TouchableOpacity>

                            {editingProduct && (
                                <TouchableOpacity
                                    style={[styles.outlineButton, { marginTop: 10 }]}
                                    onPress={() => {
                                        resetForm();
                                        setShowModal(false);
                                    }}
                                >
                                    <Text style={styles.outlineButtonText}>Hủy sửa</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

// --- STYLES (ĐÃ BỔ SUNG CHO NGUỒN ẢNH) ---
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F5F6FA'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 6,
        backgroundColor: '#F5F6FA'
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14
    },
    appTitle: {
        fontSize: 23,
        fontWeight: '500',
        color: '#1F2430',
        letterSpacing: 0.3
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,

    },
    primaryButton: {
        backgroundColor: '#D1772E',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        shadowColor: '#2D6CDF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 7,
        elevation: 3
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '400',
        fontSize: 13,
        textAlign: 'center'
    },
    secondaryButton: {
        backgroundColor: '#dfae00ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10
    },
    secondaryButtonText: {
        color: '#f5f5f5ff',
        fontWeight: '700',
        fontSize: 13
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#FFFFFF'
    },
    outlineButtonText: {
        color: '#1F2430',
        fontWeight: '700',
        fontSize: 13,
        textAlign: 'center'
    },
    dangerButton: {
        backgroundColor: '#f6dd78ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginLeft: 8
    },
    dangerButtonText: {
        color: '#D7263D',
        fontWeight: '700',
        fontSize: 13
    },
    dangerOutline: {
        borderColor: '#E4A6AE',
        backgroundColor: '#FFF'
    },
    dangerOutlineText: {
        color: '#D7263D'
    },
    iconButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#F1F3F6'
    },
    iconButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2430'
    },
    separator: {
        height: 1,
        backgroundColor: '#E6E9EE',
        marginVertical: 12
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2A3140'
    },
    emptyWrap: {
        paddingVertical: 28,
        alignItems: 'center'
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2A3140',
        marginBottom: 6
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#7D8597',
        textAlign: 'center'
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 0.5,
        borderColor: '#EEF1F5'
    },
    cardImage: {
        width: 90,
        height: 90,
        borderRadius: 14,
        marginRight: 14,
        backgroundColor: '#F0F2F7'
    },
    cardInfo: {
        flex: 1
    },
    cardName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1F2430',
        marginBottom: 4
    },
    cardPrice: {
        fontSize: 14,
        color: '#ff0000ff',
        fontWeight: '700',
        marginBottom: 4
    },
    cardMeta: {
        fontSize: 12,
        color: '#7D8597',
        marginBottom: 2
    },
    cardMetaBold: {
        fontWeight: '700',
        color: '#505A6C'
    },
    cardId: {
        fontSize: 12,
        color: '#A1A9B8'
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end'
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 20,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 46,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E6E9EE',
        marginBottom: 12
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2430'
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
        color: '#505A6C'
    },
    input: {
        height: 44,
        borderColor: '#E4E7EB',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#FAFBFD'
    },
    pickerWrap: {
        borderWidth: 1,
        borderColor: '#E4E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FAFBFD',
        marginBottom: 16
    },
    picker: {
        height: 60
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 22,
        paddingHorizontal: 24,
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 0.5,
        borderColor: '#EEF1F5'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#505A6C'
    },
    // --- STYLES MỚI CHO SEGMENTED CONTROL ---
    segmentedControl: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: '#E4E7EB',
        borderRadius: 12,
        padding: 4
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    segmentSelected: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#505A6C'
    },
    segmentTextSelected: {
        color: '#1F2430',
        fontWeight: '700'
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 16,
        backgroundColor: '#F0F2F7'
    },
    libraryButton: {
        backgroundColor: '#D1772E10',
        borderColor: '#D1772E',
        borderWidth: 1,
        borderStyle: 'dashed',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16
    },
    libraryButtonText: {
        color: '#D1772E',
        fontWeight: '600'
    }
});

export default ProductsManagement;