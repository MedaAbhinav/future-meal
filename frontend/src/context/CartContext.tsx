import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Cart, FoodItem } from '../types';
import { localCartService, LocalCartItem } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartState {
  items: LocalCartItem[];
  restaurantId: number | null;
  restaurantName: string;
  isOpen: boolean;
}

interface CartContextType extends CartState {
  addItem: (food: FoodItem, quantity?: number) => void;
  removeItem: (foodItemId: number) => void;
  updateQuantity: (foodItemId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getItemQuantity: (foodItemId: number) => number;
  subtotal: number;
  itemCount: number;
  hasDifferentRestaurant: (restaurantId: number) => boolean;
}

type CartAction =
  | { type: 'LOAD_CART'; payload: LocalCartItem[] }
  | { type: 'SET_ITEMS'; payload: LocalCartItem[] }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
    case 'SET_ITEMS': {
      const items = action.payload;
      return {
        ...state,
        items,
        restaurantId: items.length > 0 ? items[0].restaurantId : null,
        restaurantName: items.length > 0 ? items[0].restaurantName : '',
      };
    }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'CLEAR_CART':
      return { ...state, items: [], restaurantId: null, restaurantName: '', isOpen: false };
    default:
      return state;
  }
}

const initialState: CartState = {
  items: localCartService.getCart(),
  restaurantId: null,
  restaurantName: '',
  isOpen: false,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    restaurantId: initialState.items.length > 0 ? initialState.items[0].restaurantId : null,
    restaurantName: initialState.items.length > 0 ? initialState.items[0].restaurantName : '',
  });

  const { isAuthenticated } = useAuth();

  // Load cart on mount
  useEffect(() => {
    const items = localCartService.getCart();
    dispatch({ type: 'LOAD_CART', payload: items });
  }, [isAuthenticated]);

  const addItem = useCallback((food: FoodItem, quantity = 1) => {
    const newItem: LocalCartItem = {
      foodItemId: food.id,
      foodItemName: food.name,
      foodItemImage: food.image,
      price: food.price,
      quantity,
      restaurantId: food.restaurantId,
      restaurantName: food.restaurantName,
      dietaryType: food.dietaryType,
    };
    const updatedCart = localCartService.addItem(newItem);
    dispatch({ type: 'SET_ITEMS', payload: updatedCart });
  }, []);

  const removeItem = useCallback((foodItemId: number) => {
    const updatedCart = localCartService.removeItem(foodItemId);
    dispatch({ type: 'SET_ITEMS', payload: updatedCart });
  }, []);

  const updateQuantity = useCallback((foodItemId: number, quantity: number) => {
    const updatedCart = localCartService.updateQuantity(foodItemId, quantity);
    dispatch({ type: 'SET_ITEMS', payload: updatedCart });
  }, []);

  const clearCart = useCallback(() => {
    localCartService.clear();
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const getItemQuantity = useCallback(
    (foodItemId: number) => {
      const item = state.items.find(i => i.foodItemId === foodItemId);
      return item?.quantity || 0;
    },
    [state.items]
  );

  const hasDifferentRestaurant = useCallback(
    (restaurantId: number) => {
      return state.restaurantId !== null && state.restaurantId !== restaurantId && state.items.length > 0;
    },
    [state.restaurantId, state.items.length]
  );

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        getItemQuantity,
        subtotal,
        itemCount,
        hasDifferentRestaurant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
