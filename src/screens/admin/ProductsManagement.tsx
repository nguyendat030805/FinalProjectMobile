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
    getImageSource, // <--- ĐÃ THÊM HÀM ÁNH XẠ ẢNH
} from '../../database'; 

const ProductsManagement = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [productName, setProductName] = useState<string>('');
    const [productPrice, setProductPrice] = useState<string>('');
    const [productImg, setProductImg] = useState<string>('');
    const [productCategoryId, setProductCategoryId] = useState<string>('1');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        const initializeData = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadData();
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
    };

    const handleSaveProduct = async () => {
        if (!productName.trim() || !productPrice.trim() || !productImg.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền tất cả các trường');
            return;
        }

        const price = parseFloat(productPrice);
        if (isNaN(price) || price < 0) {
             Alert.alert('Lỗi', 'Giá không hợp lệ');
            return;
        }

        try {
            const categoryId = parseInt(productCategoryId);

            if (editingProduct) {
                await updateDbProduct({
                    id: editingProduct.id,
                    name: productName,
                    price,
                    img: productImg,
                    categoryId
                });
                Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
            } else {
                await addProduct({
                    name: productName,
                    price,
                    img: productImg,
                    categoryId
                });
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
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.appTitle}>Quản lý Sản phẩm</Text>
                        <Text style={styles.appSubtitle}>Quản trị kho & danh mục</Text>
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

                {/* List header */}
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
                            {/* ĐÃ SỬA: SỬ DỤNG getImageSource() để ánh xạ chuỗi DB thành require() */}
                            <Image source={getImageSource(product.img)} style={styles.cardImage} />
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

                {/* Modal bottom sheet */}
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

                            <Text style={styles.label}>Đường dẫn ảnh cục bộ (Ví dụ: ./assets/ten-file.jpg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="./assets/ten-file.jpg"
                                value={productImg}
                                onChangeText={setProductImg}
                            />

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14
    },
    appTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2430',
        letterSpacing: 0.3
    },
    appSubtitle: {
        fontSize: 12,
        color: '#7D8597',
        marginTop: 4
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    primaryButton: {
        backgroundColor: '#2D6CDF',
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
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center'
    },
    secondaryButton: {
        backgroundColor: '#E9EEF9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10
    },
    secondaryButtonText: {
        color: '#2D6CDF',
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
        backgroundColor: '#FCE8E8',
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
        color: '#2D6CDF',
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
        height: 48
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
    }
});

export default ProductsManagement;