// File: components/types.ts

import { ImageSourcePropType } from 'react-native';

export interface Product1 {
  id: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
}

// HomeStackParamList: Định nghĩa các màn hình trong Home Stack
export type HomeStackParamList = {
    Home: undefined;
    Details: { product: Product1 }; 
    Accessory: undefined;
    Fashion: undefined;
    Categories:undefined;
    About:undefined;
    AdminDashboard: undefined;
    CategoryManagement: undefined;
    UserManagement: undefined;
    AddUser:undefined;
    EditUser:{userId:number};
    ProductManagement:{categoryId:number};
    SellItems: undefined; // ✅ Thêm màn hình bán hàng
  };

// BottomTabParamList: Định nghĩa các màn hình trong Tab Navigator
export type BottomTabParamList = {
  HomeTab: undefined;
  SignupSqlite: undefined;
  LoginSqlite: undefined;
};