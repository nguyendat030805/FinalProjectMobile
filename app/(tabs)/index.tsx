import React from "react";
import AppTabs from "@/src/navigation/AppTabs";
import { CartProvider } from "@/src/context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <AppTabs />
    </CartProvider>
  );
}