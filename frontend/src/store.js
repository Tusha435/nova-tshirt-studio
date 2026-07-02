import { create } from "zustand";
import { persist } from "zustand/middleware";

const uuid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useStore = create(
  persist(
    (set, get) => ({
      patternUrl: null,
      prompt: "",
      style: "vibrant modern streetwear",
      shirtColor: "#f4f4f8",
      shirtName: "Classic Crew",
      savedDesigns: [],
      setDesign: (patch) => set((state) => ({ ...state, ...patch })),
      saveDesign: (design) =>
        set((state) => ({
          savedDesigns: [
            ...state.savedDesigns,
            { id: uuid(), createdAt: Date.now(), ...design },
          ],
        })),
      removeDesign: (id) =>
        set((state) => ({
          savedDesigns: state.savedDesigns.filter((item) => item.id !== id),
        })),
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (cartItem) =>
              cartItem.patternUrl === item.patternUrl && cartItem.color === item.color
          );

          if (existing) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === existing.id
                  ? { ...cartItem, qty: cartItem.qty + (item.qty || 1) }
                  : cartItem
              ),
            };
          }

          return {
            cart: [...state.cart, { id: uuid(), qty: item.qty || 1, ...item }],
          };
        }),
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, qty: Math.max(1, qty) } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      cartCount: () => get().cart.reduce((sum, item) => sum + item.qty, 0),
      cartTotal: () =>
        get().cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0),
    }),
    {
      name: "nova-store",
      partialize: (state) => ({
        cart: state.cart,
        savedDesigns: state.savedDesigns,
      }),
    }
  )
);