import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store.js";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, setQty, cartTotal } = useStore();
  const navigate = useNavigate();
  const total = cartTotal();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 glass p-6 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-ink/50">Your Cart</p>
                <h2 className="text-2xl font-bold">Ready to checkout</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink/60 hover:text-ink text-2xl leading-none"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 grid place-items-center text-center text-ink/40">
                <div className="space-y-4">
                  <div className="text-5xl">🛍️</div>
                  <p className="text-lg font-medium text-ink">Your cart is empty.</p>
                  <p className="max-w-xs text-sm">Design a futuristic tee and add it to the cart to unlock checkout.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="glass rounded-3xl p-4 flex gap-4">
                    <div
                      className="w-16 h-16 rounded-3xl shrink-0 grid place-items-center overflow-hidden"
                      style={{ background: item.color }}
                    >
                      {item.patternUrl ? (
                        <img src={item.patternUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-ink/80 text-sm">NOVA</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{item.name || "Custom tee"}</p>
                      <p className="text-xs text-ink/50 truncate">{item.prompt || "Generated AI design"}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                          className="w-8 h-8 rounded-2xl bg-ink/10 hover:bg-ink/20 transition"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="w-8 h-8 rounded-2xl bg-ink/10 hover:bg-ink/20 transition"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-xs uppercase tracking-[0.16em] text-pink-300/85 hover:text-pink-300"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-ink/10 pt-5 mt-5">
                <div className="flex items-center justify-between text-ink/60 mb-4">
                  <span>Total</span>
                  <span className="text-xl font-semibold">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/checkout");
                  }}
                  className="btn-neon w-full py-3 rounded-3xl"
                >
                  Checkout →
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}