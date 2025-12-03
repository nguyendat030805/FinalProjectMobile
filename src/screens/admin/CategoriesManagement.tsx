/* ====================================
    Luxury Premium UI – Optimized Version
    ==================================== */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Modal,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';

import {
    fetchCategories,
    addCategory,
    updateCategory as updateDbCategory,
    deleteCategory as deleteDbCategory,
    Category
} from '../../database';


const CategoriesManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            await new Promise(r => setTimeout(r, 500));
            await loadCategories();
        };
        init();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch {
            Alert.alert("Lỗi", "Không thể tải danh mục");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setCategoryName('');
        setEditingCategory(null);
    };

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên danh mục");
            return;
        }

        try {
            if (editingCategory) {
                await updateDbCategory({ id: editingCategory.id, name: categoryName });
                Alert.alert("Thành công", "Đã cập nhật danh mục");
            } else {
                await addCategory({ name: categoryName });
                Alert.alert("Thành công", "Đã thêm danh mục mới");
            }
            loadCategories();
            resetForm();
            setShowModal(false);
        } catch {
            Alert.alert("Lỗi", "Không thể lưu danh mục");
        }
    };

    const handleDeleteCategory = (id: number, name: string) => {
        Alert.alert(
            "Xóa Danh Mục?",
            `Bạn có chắc muốn xóa "${name}" không?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDbCategory(id);
                            await loadCategories();
                            Alert.alert("Thành công", "Đã xóa danh mục");
                        } catch {
                            Alert.alert("Lỗi", "Không thể xóa danh mục");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#D4AF37" /> 
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Danh mục sản phẩm</Text>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <Text style={styles.addButtonText}>+ Thêm</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />
                
                {/* LIST */}
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {categories.length === 0 ? (
                        <Text style={styles.empty}>Chưa có danh mục nào.</Text>
                    ) : (
                        <View style={styles.listContainer}>
                            {categories.map(cat => (
                                <View key={cat.id} style={styles.card}>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle}>{cat.name}</Text>
                                        <Text style={styles.cardId}>ID: {cat.id}</Text>
                                    </View>

                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => {
                                                setEditingCategory(cat);
                                                setCategoryName(cat.name);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Text style={styles.editBtnText}>Sửa</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDeleteCategory(cat.id, cat.name)}
                                        >
                                            <Text style={styles.deleteBtnText}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* MODAL */}
                <Modal transparent visible={showModal} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>

                            <Text style={styles.modalTitle}>
                                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Tên danh mục..."
                                placeholderTextColor="#888"
                                value={categoryName}
                                onChangeText={setCategoryName}
                            />

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCategory}>
                                <Text style={styles.saveBtnText}>
                                    {editingCategory ? "Cập nhật" : "Lưu"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    resetForm();
                                    setShowModal(false);
                                }}
                            >
                                <Text style={styles.cancelBtnText}>Hủy</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

/* ========================================
    PREMIUM LUXURY DARK–GOLD STYLING
    ======================================== */

const GOLD = "#D4AF37";
const DARK = "#0E0E0E";

const styles = StyleSheet.create({

    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
    },
    
    header: {
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingTop: 20,
    },

    pageTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: '#333',
        letterSpacing: 1,
    },

    addButton: {
        backgroundColor: '#D1772E',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        elevation: 5,
    },
    addButtonText: {
        fontWeight: "bold",
        fontSize: 13,
        color: '#ffffff'
    },

    separator: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginBottom: 20,
    },
    
    // --- List Layout (3 Columns) ---
    scrollContent: {
        paddingBottom: 20,
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },

    /* LIST CARD (3 columns) */
    card: {
        flexBasis: '32%', 
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },

    cardInfo: { 
        flex: 1,
        marginBottom: 10,
        alignItems: 'center', 
    },

    cardTitle: {
        fontSize: 13, 
        fontWeight: "600",
        color: "#000000",
        marginBottom: 4,
        textAlign: 'center',
    },

    cardId: {
        color: "#aaa",
        fontSize: 11,
        textAlign: 'center',
    },

    cardActions: {
        flexDirection: "row",
        justifyContent: 'center',
        gap: 5,
        marginTop: 5,
    },

    editBtn: {
        backgroundColor: "#D1772E",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },

    deleteBtn: {
        backgroundColor: "#e2a26dff",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },

    editBtnText: { color: "#fff", fontWeight: "600", fontSize: 11 },
    deleteBtnText: { color: "#fff", fontWeight: "600", fontSize: 11 },

    empty: {
        textAlign: "center",
        color: "#777",
        fontStyle: "italic",
        marginTop: 40,
        fontSize: 16
    },

    /* MODAL */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        backgroundColor: '#fff',
        width: "85%",
        padding: 25,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },

    modalTitle: {
        fontSize: 22,
        textAlign: "center",
        fontWeight: "800",
        color: '#333',
        marginBottom: 20,
        letterSpacing: 0.5
    },

    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        color: "#333",
        marginBottom: 18,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },

    saveBtn: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    saveBtnText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "800",
        color: "#fff"
    },

    cancelBtn: {
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    cancelBtnText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },

    loading: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 15,
        color: "#666",
        fontSize: 16
    }
});

export default CategoriesManagement;