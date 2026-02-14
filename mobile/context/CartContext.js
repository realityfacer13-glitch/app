import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addToCart, getCart, removeCartItem, updateCartItem } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  useEffect(() => {
    if (!token) {
      setCart({ items: [], total: 0 });
      return;
    }

    getCart(token).then(setCart).catch(() => setCart({ items: [], total: 0 }));
  }, [token]);

  const value = useMemo(
    () => ({
      cart,
      addItem: async (productId, quantity = 1) => setCart(await addToCart(token, { productId, quantity })),
      updateItem: async (productId, quantity) => setCart(await updateCartItem(token, productId, { quantity })),
      removeItem: async (productId) => setCart(await removeCartItem(token, productId))
    }),
    [cart, token]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
