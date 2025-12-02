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
    img: string;
    categoryId: number;
};

export type User = {
    id: number;
    username: string;
    password: string; // Giữ lại cho mục đích type matching, nhưng KHÔNG NÊN LƯU plaintext
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

const initialProducts: Product[] = [
    { id: 1, name: 'Lamborghini Revuelto', price: 250000, img:require( './assets/hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg'), categoryId: 1 },
    { id: 2, name: 'Lamborghini Aventador', price: 1100000, img:require( './assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg'), categoryId: 2 },
    { id: 3, name: 'Ferrari F8 Tributo / Spider', price: 490000, img:require( './assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'), categoryId: 3 },
    { id: 4, name: 'Maserati MC20 / MC20 Cielo', price: 120000, img:require( './assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'), categoryId: 4 },
    { id: 5, name: 'Porsche Taycan', price: 980000, img: require('./assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg'), categoryId: 5 },
];

// ------------------- Reset/Delete Database -------------------
export const resetDatabase = async (): Promise<void> => {
    try {
        // First, try to drop all tables
        try {
            const database = await getDb();
            await database.execAsync('DROP TABLE IF EXISTS products');
            await database.execAsync('DROP TABLE IF EXISTS categories');
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
            await database.runAsync('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [cat.id, cat.name]);
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
            await database.runAsync(
                'INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
                [prod.id, prod.name, prod.price, prod.img, prod.categoryId]
            );
        }
        console.log(`✅ Inserted ${initialProducts.length} products`);

        // --- Migration: chuyển các đường dẫn ảnh cũ (items_Picture) sang ./assets/ --
        try {
            const outdated: Array<{ id: number; img: string }> = await database.getAllAsync(
                "SELECT id, img FROM products WHERE img LIKE '%items_Picture/%'"
            );
            for (const row of outdated) {
                const parts = row.img.split('/');
                const fname = parts[parts.length - 1];
                const newImg = `./assets/${fname}`;
                await database.runAsync('UPDATE products SET img = ? WHERE id = ?', [newImg, row.id]);
                console.log(`🔄 Migrated product ${row.id} image to ${newImg}`);
            }
        } catch (merr) {
            console.warn('⚠️ Image migration skipped (table may not exist yet)');
        }

        // 3. Users
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
            `INSERT INTO users (username, password, role)
             SELECT 'admin', '123456', 'admin'
             WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`
        );

        // Add demo users
        await database.runAsync(
            `INSERT INTO users (username, password, role)
             SELECT 'user1', 'password1', 'user'
             WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1')`
        );
        await database.runAsync(
            `INSERT INTO users (username, password, role)
             SELECT 'user2', 'password2', 'user'
             WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user2')`
        );
        await database.runAsync(
            `INSERT INTO users (username, password, role)
             SELECT 'guest1', 'guestpass', 'guest'
             WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'guest1')`
        );

        console.log('✅ Database initialized');
        if (onSuccess) onSuccess();

    } catch (error) {
        console.error('❌ initDatabase error:', error);
    }
};

// ------------------- Fetch (API hiện đại: getAllAsync) -------------------
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
// Thêm đoạn code này vào file database services hiện tại của bạn

// ------------------- Fetch Products by Category ID -------------------
export const fetchProductsByCategoryId = async (categoryId: number): Promise<Product[]> => {
    try {
        const database = await getDb();
        if (!database) {
            console.error('❌ Database is null when fetching products by categoryId');
            return [];
        }
        
        // SỬ DỤNG CÂU LỆNH SQL CÓ ĐIỀU KIỆN WHERE
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

// --- BẢN ĐỒ ÁNH XẠ ẢNH (Vì require() không hoạt động trực tiếp với chuỗi từ DB) ---
// Hàm này giúp ánh xạ chuỗi đường dẫn cục bộ (local path string) thành module require()
export const getImageSource = (imgString: string) => {
    switch (imgString) {
        case './assets/1.jpg':
            return require('./assets/hinh-anh-sieu-xe-lamborghini-doc-dao_062150116.jpg');
        case './assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg':
            return require('./assets/Hình-siêu-xe-4k-cực-nét-cho-laptop-máy-tính-scaled.jpg');
        case './assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg':
            return require('./assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg');
        case './assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg':
            return require('./assets/Hình-siêu-xe-Lamborghini-cực-đẹp-scaled.jpg');
        // Thêm đường dẫn cho các ảnh khác nếu có
        default:
            // Sử dụng một placeholder nếu không tìm thấy đường dẫn
            return require('./assets/Hình-Siêu-xe-4k-cực-đẹp-scaled.jpg'); 
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
        
        // SỬA LỖI: Truy vấn trực tiếp bằng cả username và password
        const user = await db.getFirstAsync<User>(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        
        // user sẽ là một đối tượng User nếu tìm thấy, hoặc undefined nếu không tìm thấy
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

// ------------------- Reset then Re-initialize -------------------
// Utility to drop existing tables and immediately re-run initDatabase
export const resetAndInitDatabase = async (onSuccess?: () => void): Promise<void> => {
    try {
        await resetDatabase();

        // set cached db to null so getDb() can re-open if needed
        db = null as unknown as SQLiteDatabase | null;

        // Wait a bit for file system to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        // Re-initialize (will recreate tables and seed initial data)
        await initDatabase(onSuccess);
        console.log('✅ Database reset and re-initialized');
    } catch (error) {
        console.error('❌ Error during resetAndInitDatabase:', error);
    }
};