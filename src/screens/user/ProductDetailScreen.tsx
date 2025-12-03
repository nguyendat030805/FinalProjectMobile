import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	FlatList,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackParamList } from '../HomeScreen';
import { useCart } from '../../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProducts, Product } from '../../database';
import { getImageSource } from '../../database';

type Props = {
	route: RouteProp<HomeStackParamList, 'ProductDetail'>;
	navigation: any;
};

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
	const { product } = route.params;
	const { addToCart } = useCart();
	const insets = useSafeAreaInsets();

	const [quantity, setQuantity] = useState<number>(1);
	const [related, setRelated] = useState<Product[]>([]);

	useEffect(() => {
		const loadRelated = async () => {
			try {
				const all = await fetchProducts();
				const others = all.filter((p) => p.id !== product.id).slice(0, 6);
				setRelated(others);
			} catch (e) {
				console.warn('Could not load related products', e);
			}
		};
		loadRelated();
	}, [product]);

	const handleAddToCart = () => {
		addToCart(product, quantity, 'Đỏ');
		navigation.navigate('Cart' as any);
	};

	const handleBuyNow = async () => {
		const user = await AsyncStorage.getItem('loggedInUser');
		if (!user) {
			// prompt login
			return navigation.navigate('LoginSqlite' as any);
		}
		// Add to cart and go to checkout
		addToCart(product, quantity, 'Đỏ');
		navigation.navigate('Cart' as any);
	};

	const renderRelated = ({ item }: { item: Product }) => (
		<TouchableOpacity
			style={styles.relatedCard}
			onPress={() => navigation.push('ProductDetail' as any, { product: item })}
		>
			<Image source={getImageSource(item.img)} style={styles.relatedImage} />
			<Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
			<Text style={styles.relatedPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
		</TouchableOpacity>
	);

	return (
		<ScrollView contentContainerStyle={{ ...styles.container, paddingBottom: 16 + insets.bottom }}>
			<Image source={getImageSource(product.img)} style={styles.image} />

			<View style={styles.infoRow}>
				<Text style={styles.title}>{product.name}</Text>
				<Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
			</View>

			<Text style={styles.desc}> Mô tả sản phẩm chưa có. Đây là mô tả demo cho sản phẩm này</Text>

			<View style={styles.controls}>
				<View style={styles.qtyBox}>
					<TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
						<Text style={styles.qtyBtnText}>−</Text>
					</TouchableOpacity>
					<Text style={styles.qtyValue}>{quantity}</Text>
					<TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
						<Text style={styles.qtyBtnText}>+</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
					<Text style={styles.addBtnText}>Thêm vào giỏ</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
					<Text style={styles.buyBtnText}>Mua ngay</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.separator} />
			<Text style={styles.sectionTitle}>Sản phẩm gợi ý</Text>
			<FlatList
				data={related}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(i) => i.id.toString()}
				renderItem={renderRelated}
				contentContainerStyle={{ paddingHorizontal: 12 }}
			/>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { padding: 16, backgroundColor: '#fff' },
	image: { width: '100%', height: 220, resizeMode: 'cover', borderRadius: 8, marginBottom: 12 },
	infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	title: { fontSize: 16, fontWeight: '700', flex: 1 },
	price: { fontSize: 18, fontWeight: '700', color: '#ff0000ff', marginLeft: 12 },
	desc: { fontSize: 14, color: '#444', marginVertical: 12 },
	controls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
	qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', padding: 6, borderRadius: 8 },
	qtyBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#ddd', borderRadius: 6 },
	qtyBtnText: { fontSize: 18, fontWeight: '700' },
	qtyValue: { marginHorizontal: 12, fontSize: 16, fontWeight: '700' },
	addBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
	addBtnText: { fontWeight: '700' },
	buyBtn: { backgroundColor: '#dc9911ff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
	buyBtnText: { color: '#fff', fontWeight: '800' },
	separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
	sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
	relatedCard: { width: 140, marginRight: 12, backgroundColor: '#fff' },
	relatedImage: { width: 140, height: 90, borderRadius: 8, marginBottom: 6, backgroundColor: '#f0f0f0' },
	relatedName: { fontSize: 10, fontWeight: '600' },
	relatedPrice: { fontSize: 13, color: '#E91E63', marginTop: 4 },
});

export default ProductDetailScreen;
