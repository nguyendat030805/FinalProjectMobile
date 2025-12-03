import * as SQLite from 'expo-sqlite';

// --- Database Connection (Sử dụng API hiện đại) ---
type SQLiteDatabase = SQLite.SQLiteDatabase;
let db: SQLiteDatabase | null = null;

const DB_NAME = 'myDatabase.db';

const getDb = async (): Promise<SQLiteDatabase> => {
    if (db) return db;
    try {
        // Mở DB bằng hàm bất đồng bộ mới
        db = await SQLite.openDatabaseAsync(DB_NAME);
        return db;
    } catch (error) {
        console.error('❌ Error opening database:', error);
        throw error;
    }
};

// ------------------- Type definitions -------------------
export type Category = {
    id: number;
    name: string;
};

export type Product = {
    id: number;
    name: string;
    price: number;
    img: string; // Chỉ lưu TÊN FILE (Ví dụ: '1.jpg')
    categoryId: number;
};

export type User = {
    id: number;
    username: string;
    password: string; 
    role: string;
};

// ------------------- Initial Data -------------------
const initialCategories: Category[] = [
    { id: 1, name: 'Lamborghini' },
    { id: 2, name: 'Audi' },
    { id: 3, name: 'Ferrari' },
    { id: 4, name: 'Maserati' },
    { id: 5, name: 'Porsche' },
];

// 🔴 ĐÃ SỬA: SỬ DỤNG TÊN FILE DUY NHẤT (Không có './assets/' hay đường dẫn tuyệt đối)
const initialProducts: Product[] = [
    { id: 1, name: 'Lamborghini Revuelto', price: 250000, img: 'hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg', categoryId: 1 },
    { id: 2, name: 'Lamborghini Aventador', price: 1100000, img: 'Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg', categoryId: 1 },
    { id: 3, name: 'Ferrari F8 Tributo / Spider', price: 490000, img: 'Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg', categoryId: 3 },
    { id: 4, name: 'Maserati MC20 / MC20 Cielo', price: 120000, img: 'Hình-siêu-xe-cực-nét.jpg', categoryId: 4 },
    { id: 5, name: 'Audi R8 V10', price: 980000, img: 'Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg', categoryId: 2 },
    { id: 6, name: 'Porsche Taycan', price: 980000, img: '1.jpg', categoryId: 5 },
];

// ------------------- Reset/Delete Database -------------------
export const resetDatabase = async (): Promise<void> => {
    try {
        // First, try to drop all tables
        try {
            const database = await getDb();
            // Đã sửa lỗi chính tả: execAsync chứ không phải runAsync cho lệnh DROP
            await database.execAsync('DROP TABLE IF EXISTS products');
            await database.execAsync('DROP TABLE IF EXISTS categories');
            await database.execAsync('DROP TABLE IF EXISTS users');
            console.log('✅ All tables dropped');
        } catch (dropError) {
            console.warn('Warning dropping tables:', dropError);
        }

        // Close current connection
        if (db) {
            try {
                await db.closeAsync();
            } catch (e) {
                console.warn('Warning closing DB:', e);
            }
            db = null;
        }

        console.log('✅ Database reset complete - ready for reinit');
    } catch (error) {
        console.error('❌ Error resetting database:', error);
    }
};

// ------------------- Initialize Database -------------------
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
    try {
        const database = await getDb();

        // 1. Categories
        await database.execAsync('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
        for (const cat of initialCategories) {
            // Sử dụng INSERT OR REPLACE thay vì IGNORE để đảm bảo dữ liệu mới được áp dụng
            await database.runAsync('INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)', [cat.id, cat.name]);
        }

        // 2. Products
        await database.execAsync(
            `CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY, 
              name TEXT,
              price REAL,
              img TEXT,
              categoryId INTEGER,
              FOREIGN KEY (categoryId) REFERENCES categories(id)
            )`
        );
        for (const prod of initialProducts) {
            // Sử dụng INSERT OR REPLACE để cập nhật dữ liệu nếu id đã tồn tại
            await database.runAsync(
                'INSERT OR REPLACE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
                [prod.id, prod.name, prod.price, prod.img, prod.categoryId]
            );
        }
        console.log(`✅ Inserted ${initialProducts.length} products`);


        await database.execAsync(
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE,
              password TEXT, 
              role TEXT
            )`
        );

        // Add default admin
        await database.runAsync(
            `INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', '123456', 'admin')`
        );

        // Add demo users
        await database.runAsync(
            `INSERT OR IGNORE INTO users (username, password, role) VALUES ('user1', 'password1', 'user')`
        );
        await database.runAsync(
            `INSERT OR IGNORE INTO users (username, password, role) VALUES ('user2', 'password2', 'user')`
        );
        await database.runAsync(
            `INSERT OR IGNORE INTO users (username, password, role) VALUES ('guest1', 'guestpass', 'guest')`
        );


        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();

    } catch (error) {
        console.error('❌ initDatabase error:', error);
    }
};

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const database = await getDb();
        if (!database) {
            console.error('❌ Database is null when fetching categories');
            return [];
        }
        const items = await database.getAllAsync<Category>('SELECT * FROM categories');
        return items || [];
    } catch (error: any) {
        console.error('❌ Error fetching categories:', error.message);
        return [];
    }
};

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const database = await getDb();
        if (!database) {
            console.error('❌ Database is null when fetching products');
            return [];
        }
        const items = await database.getAllAsync<Product>('SELECT * FROM products');
        return items || [];
    } catch (error: any) {
        console.error('❌ Error fetching products:', error.message);
        return [];
    }
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const database = await getDb();
        if (!database) {
            console.error('❌ Database is null when fetching users');
            return [];
        }
        const users = await database.getAllAsync<User>('SELECT * FROM users');
        return users || [];
    } catch (error: any) {
        console.error('❌ Error fetching users:', error.message);
        return [];
    }
};

export const fetchProductsByCategoryId = async (categoryId: number): Promise<Product[]> => {
    try {
        const database = await getDb();
        if (!database) {
            console.error('❌ Database is null when fetching products by categoryId');
            return [];
        }
        const items = await database.getAllAsync<Product>(
            'SELECT * FROM products WHERE categoryId = ?', 
            [categoryId]
        );
        return items || [];
    } catch (error: any) {
        console.error(`❌ Error fetching products for category ${categoryId}:`, error.message);
        return [];
    }
};

// ------------------- CRUD Products -------------------
export const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
        const db = await getDb();
        await db.runAsync(
            'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
            [product.name, product.price, product.img, product.categoryId]
        );
        console.log('✅ Product added');
    } catch (error: any) {
        console.error('❌ Error adding product:', error.message);
    }
};

export const updateProduct = async (product: Product) => {
    try {
        const db = await getDb();
        await db.runAsync(
            'UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?',
            [product.name, product.price, product.categoryId, product.img, product.id]
        );
        console.log('✅ Product updated');
    } catch (error: any) {
        console.error('❌ Error updating product:', error.message);
    }
};

export const deleteProduct = async (id: number) => {
    try {
        const db = await getDb();
        await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
        console.log('✅ Product deleted');
    } catch (error: any) {
        console.error('❌ Error deleting product:', error.message);
    }
};

// ------------------- CRUD Users -------------------

// ➕ Thêm người dùng (Lưu plaintext, KHÔNG KHUYẾN KHÍCH)
export const addUser = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
        const db = await getDb();
        await db.runAsync('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
        console.log('✅ User added');
        return true;
    } catch (error: any) {
        console.error('❌ Error adding user:', error.message);
        return false;
    }
};

// 🔑 Lấy người dùng theo username & password (FIXED: Sử dụng truy vấn trực tiếp)
export const getUserByCredentials = async (username: string, password: string): Promise<User | null> => {
    try {
        const db = await getDb();
        const user = await db.getFirstAsync<User>(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        return user || null; 

    } catch (error: any) {
        console.error('❌ Error during login process (database):', error.message);
        return null;
    }
};

// ✏️ Cập nhật người dùng
export const updateUser = async (user: User) => {
    try {
        const db = await getDb();
        await db.runAsync('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [
            user.username,
            user.password,
            user.role,
            user.id,
        ]);
        console.log('✅ User updated');
    } catch (error: any) {
        console.error('❌ Error updating user:', error.message);
    }
};

// ❌ Xóa người dùng theo id
export const deleteUser = async (id: number) => {
    try {
        const db = await getDb();
        await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
        console.log('✅ User deleted');
    } catch (error: any) {
        console.error('❌ Error deleting user:', error.message);
    }
};

// 🔎 Lấy người dùng theo id
export const getUserById = async (id: number): Promise<User | null> => {
    try {
        const db = await getDb();
        const user = await db.getFirstAsync<User>(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return user || null;
    } catch (error: any) {
        console.error('❌ Error getting user by id:', error.message);
        return null;
    }
};

// ------------------- Search -------------------
export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
    try {
        const db = await getDb();
        const products = await db.getAllAsync<Product>(
            `SELECT products.* FROM products
             JOIN categories ON products.categoryId = categories.id
             WHERE products.name LIKE ? OR categories.name LIKE ?`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        return products;
    } catch (error: any) {
        console.error('❌ Error searching products:', error.message);
        return [];
    }
};

export const searchProductsAdvanced = async (
    keyword: string,
    minPrice?: number,
    maxPrice?: number
): Promise<Product[]> => {
    try {
        const db = await getDb();
        let query = `SELECT products.* FROM products
                             JOIN categories ON products.categoryId = categories.id
                             WHERE (products.name LIKE ? OR categories.name LIKE ?)`;
        const params: (string | number)[] = [`%${keyword}%`, `%${keyword}%`];

        if (minPrice !== undefined) {
            query += ' AND products.price >= ?';
            params.push(minPrice);
        }
        if (maxPrice !== undefined) {
            query += ' AND products.price <= ?';
            params.push(maxPrice);
        }

        const products = await db.getAllAsync<Product>(query, params);
        return products;
    } catch (error: any) {
        console.error('❌ Error searching products advanced:', error.message);
        return [];
    }
};

export const searchUsers = async (keyword: string): Promise<User[]> => {
    try {
        const db = await getDb();
        const users = await db.getAllAsync<User>(
            `SELECT * FROM users WHERE username LIKE ? OR role LIKE ?`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        return users;
    } catch (error: any) {
        console.error('❌ Error searching users:', error.message);
        return [];
    }
};

// ------------------- CRUD Categories -------------------
export const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
        const db = await getDb();
        await db.runAsync(
            'INSERT INTO categories (name) VALUES (?)',
            [category.name]
        );
        console.log('✅ Category added');
    } catch (error: any) {
        console.error('❌ Error adding category:', error.message);
    }
};

export const updateCategory = async (category: Category) => {
    try {
        const db = await getDb();
        await db.runAsync(
            'UPDATE categories SET name = ? WHERE id = ?',
            [category.name, category.id]
        );
        console.log('✅ Category updated');
    } catch (error: any) {
        console.error('❌ Error updating category:', error.message);
    }
};

export const deleteCategory = async (id: number) => {
    try {
        const db = await getDb();
        await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
        console.log('✅ Category deleted');
    } catch (error: any) {
        console.error('❌ Error deleting category:', error.message);
    }
};
const imageAssets: { [key: string]: any } = {
    'hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg': require('./assets/hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg'),
    'Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg': require('./assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg'),
    'Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg': require('./assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'),
    'Hình-siêu-xe-cực-nét.jpg': require('./assets/Hình-siêu-xe-cực-nét.jpg'),
    'Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg': require('./assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg'),
    '1.jpg': require('./assets/1.jpg'),
    '26900.jpg': require('./assets/26900.jpg'), 
};
const isUri = (str: string) => {
    return str.startsWith('http') || str.startsWith('file://') || str.startsWith('content://') || str.startsWith('asset://');
};
export const getImageSource = (img: string) => {
    if (!img) {
        return require('./assets/26900.jpg'); 
    }
    if (isUri(img)) {
        return { uri: img }; 
    }
    const normalizedPath = img.replace(/\\/g, '/');
    const filename = normalizedPath.split('/').pop() || '';
    
 
    if (imageAssets[filename]) {
        return imageAssets[filename]; 
    }
    console.warn(`⚠️ Image not found in map for filename: ${filename}. Using fallback.`);
    return require('./assets/26900.jpg'); 
};

export const resetAndInitDatabase = async (onSuccess?: () => void): Promise<void> => {
    try {
        await resetDatabase();
        db = null as unknown as SQLiteDatabase | null;
        await new Promise(resolve => setTimeout(resolve, 500));
        await initDatabase(onSuccess);
        console.log('✅ Database reset and re-initialized');
    } catch (error) {
        console.error('❌ Error during resetAndInitDatabase:', error);
    }
};
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