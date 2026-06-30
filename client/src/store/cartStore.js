import { create } from 'zustand';
import { cartApi } from '../api/cartApi';

const CART_STORAGE_KEY = 'nexusplay_cart';

const useCartStore = create((set, get) => ({
  items: [],
  summary: { item_count: 0, subtotal: 0, discount: 0, total: 0 },
  isLoading: false,

  // Load cart for authenticated users
  loadCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.getCart();
      set({
        items: data.data.items,
        summary: data.data.summary,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Add item (authenticated)
  addItem: async (gamePlatformId, quantity = 1) => {
    const { data } = await cartApi.addItem(gamePlatformId, quantity);
    set({ items: data.data.items, summary: data.data.summary });
    return data;
  },

  // Remove item (authenticated)
  removeItem: async (itemId) => {
    const { data } = await cartApi.removeItem(itemId);
    set({ items: data.data.items, summary: data.data.summary });
  },

  // Clear cart (authenticated)
  clearCart: async () => {
    await cartApi.clearCart();
    set({ items: [], summary: { item_count: 0, subtotal: 0, discount: 0, total: 0 } });
  },

  // Merge local cart to server after login
  mergeCart: async () => {
    const localCart = get().getLocalCart();
    if (localCart.length > 0) {
      try {
        const { data } = await cartApi.mergeCart(localCart);
        set({ items: data.data.items, summary: data.data.summary });
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // If merge fails, just load server cart
        await get().loadCart();
      }
    } else {
      await get().loadCart();
    }
  },

  // Local cart operations (for anonymous users)
  getLocalCart: () => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  addToLocalCart: (item) => {
    const cart = get().getLocalCart();
    const existing = cart.find(i => i.game_platform_id === item.game_platform_id);
    if (existing) {
      if (existing.quantity >= 5) {
        throw new Error('Maximum 5 copies per product');
      }
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    set({
      items: cart,
      summary: {
        item_count: cart.length,
        subtotal: cart.reduce((sum, i) => sum + (parseFloat(i.base_price) || 0), 0),
        discount: cart.reduce((sum, i) => sum + ((parseFloat(i.base_price) || 0) - (parseFloat(i.final_price) || 0)), 0),
        total: cart.reduce((sum, i) => sum + (parseFloat(i.final_price) || 0), 0),
      },
    });
  },

  removeFromLocalCart: (gamePlatformId) => {
    const cart = get().getLocalCart().filter(i => i.game_platform_id !== gamePlatformId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    set({
      items: cart,
      summary: {
        item_count: cart.length,
        subtotal: cart.reduce((sum, i) => sum + (parseFloat(i.base_price) || 0), 0),
        discount: cart.reduce((sum, i) => sum + ((parseFloat(i.base_price) || 0) - (parseFloat(i.final_price) || 0)), 0),
        total: cart.reduce((sum, i) => sum + (parseFloat(i.final_price) || 0), 0),
      },
    });
  },

  clearLocalCart: () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ items: [], summary: { item_count: 0, subtotal: 0, discount: 0, total: 0 } });
  },

  getItemCount: () => {
    return get().items.length || get().summary.item_count;
  },
}));

export default useCartStore;
