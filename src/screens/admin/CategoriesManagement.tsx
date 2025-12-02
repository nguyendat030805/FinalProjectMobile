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
    ActivityIndicator
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
                <ActivityIndicator size="large" color={GOLD} />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>

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
                {categories.length === 0 ? (
                    <Text style={styles.empty}>Chưa có danh mục nào.</Text>
                ) : (
                    categories.map(cat => (
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
                    ))
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
    );
};

/* ========================================
   PREMIUM LUXURY DARK–GOLD STYLING
   ======================================== */

const GOLD = "#D4AF37";
const DARK = "#0E0E0E";
const MEDIUM = "#181818";

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: DARK,
        paddingHorizontal: 20,
        paddingTop: 40,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    pageTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: GOLD,
        letterSpacing: 1,
        textShadowColor: "rgba(212,175,55,0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },

    addButton: {
        backgroundColor: GOLD,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        elevation: 5,
    },
    addButtonText: {
        fontWeight: "bold",
        fontSize: 15,
        color: DARK
    },

    separator: {
        height: 1,
        backgroundColor: "#333",
        marginBottom: 20,
    },

    /* LIST CARD */
    card: {
        flexDirection: "row",
        padding: 18,
        backgroundColor: MEDIUM,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        shadowColor: GOLD,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },

    cardInfo: { flex: 1 },

    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },

    cardId: {
        color: "#aaa",
        fontSize: 13,
    },

    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    editBtn: {
        backgroundColor: "#007bff",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },

    deleteBtn: {
        backgroundColor: "#d9534f",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },

    editBtnText: { color: "#fff", fontWeight: "600" },
    deleteBtnText: { color: "#fff", fontWeight: "600" },

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
        backgroundColor: MEDIUM,
        width: "85%",
        padding: 25,
        borderRadius: 14,
        shadowColor: GOLD,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },

    modalTitle: {
        fontSize: 22,
        textAlign: "center",
        fontWeight: "800",
        color: GOLD,
        marginBottom: 20,
        letterSpacing: 0.5
    },

    input: {
        backgroundColor: "#242424",
        padding: 15,
        borderRadius: 10,
        color: "#fff",
        marginBottom: 18,
        fontSize: 16,
    },

    saveBtn: {
        backgroundColor: GOLD,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
    },
    saveBtnText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "800",
        color: DARK
    },

    cancelBtn: {
        borderColor: "#666",
        borderWidth: 1,
        padding: 14,
        borderRadius: 10,
    },
    cancelBtnText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "600",
        color: "#aaa",
    },

    loading: {
        flex: 1,
        backgroundColor: DARK,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 15,
        color: "#ccc",
        fontSize: 16
    }
});

export default CategoriesManagement;
