import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ecom_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ecom_cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = async (product) => {
    const productId = product.id || product._id;
    const quantity = 1;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('https://ecommerce-platform-09ag.onrender.com/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity })
        });
      }
    } catch (err) {
      console.error('Failed to sync cart with backend:', err);
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => (item.id || item._id) === productId);
      if (existingIndex > -1) {
        return prevCart.map((item, index) =>
          index === existingIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prevCart, { ...product, id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`https://ecommerce-platform-09ag.onrender.com/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Failed to remove item from backend cart:', err);
    }

    setCart((prevCart) => prevCart.filter((item) => (item.id || item._id) !== productId));
  };

  const decreaseQuantity = async (productId) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => (item.id || item._id) === productId);
      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        if (item.quantity > 1) {
          return prevCart.map((cartItem, index) =>
            index === existingIndex ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
          );
        } else {
          removeFromCart(productId);
          return prevCart.filter((cartItem) => (cartItem.id || cartItem._id) !== productId);
        }
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('ecom_cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

