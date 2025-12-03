import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UserManagementScreen from './UserManagement';
import CategoriesManagement from './CategoriesManagement';
import Header from '../../Header';
import ProductsManagement from './ProductsManagement';

type TabType = 'users' | 'categories' | 'products';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagementScreen />;
            case 'categories':
                return <CategoriesManagement />;
            case 'products':
                return <ProductsManagement />;
            default:
                return <UserManagementScreen />;
        }
    };

    const TabButton = ({ tab,  label }: { tab: TabType;  label: string }) => (
        <TouchableOpacity
            style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab)}
        >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <LinearGradient
                colors={['#1a1a1a', '#2d2d2d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
            </LinearGradient>
            <Header/>
            {/* Premium Tab Navigation */}
            <View style={styles.tabBarContainer}>
                <View style={styles.tabBar}>
                    <TabButton tab="users" label="Người dùng" />
                    <TabButton tab="categories" label="Category" />
                    <TabButton tab="products"  label="Sản phẩm" />
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderContent()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    headerGradient: {
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffffff',
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#B0B0B0',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    tabBarContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tabButtonActive: {
        backgroundColor: '#eabc02ff',
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    tabIcon: {
        fontSize: 20,
        marginBottom: 4,
        color: '#666',
    },
    tabIconActive: {
        fontSize: 2,
        color: '#FFD700',
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    tabLabelActive: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000ff',
    },
    content: {
        flex: 1,
    },
});

export default AdminDashboard;
