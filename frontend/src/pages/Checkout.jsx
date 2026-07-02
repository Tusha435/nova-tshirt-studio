import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Page from "../components/Page.jsx";
import { useStore } from "../store.js";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const [placed, setPlaced] = useState(false);
  const navigate = useNavigate();
  const subtotal = cartTotal();
  const shipping = cart.length ? 5 : 0;
  const total = subtotal + shipping;

  function placeOrder(e) {
    e.preventDefault();
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <Page className="max-w-2xl mx-auto px-5 py-24 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-3">Order placed!</h1>
          <p className="text-white/50 mb-8">
            This is a demo checkout — no payment was taken. Your AI-designed tees are
            “on their way”.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/studio" className="btn-neon px-6 py-3 rounded-xl">
              Design another →
            </Link>
            <Link to="/" className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5">
              Home
            </Link>
          </div>
        </motion.div>
      </Page>
    );
  }

  if (!cart.length) {
    return (
      <Page className="max-w-2xl mx-auto px-5 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/shop" className="btn-neon px-6 py-3 rounded-xl">
          Go to shop →
        </Link>
      </Page>
    );
  }

  return (
    <Page className="max-w-5xl mx-auto px-5 py-12">
      <h1 className="text-4xl font-bold mb-10">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        {/* form */}
        <form onSubmit={placeOrder} className="lg:col-span-3 glass rounded-3xl p-7 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Shipping details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required type="text" placeholder="Full name" className="w-full" />
            <input required type="text" placeholder="Email" className="w-full" />
          </div>
          <input required type="text" placeholder="Address" className="w-full" />
          <div className="grid sm:grid-cols-3 gap-4">
            <input required type="text" placeholder="City" className="w-full" />
            <input required type="text" placeholder="ZIP" className="w-full" />
            <input required type="text" placeholder="Country" className="w-full" />
          </div>
          <h2 className="text-lg font-semibold pt-4">Payment</h2>
          <input required type="text" placeholder="Card number (demo — not charged)" className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="MM / YY" className="w-full" />
            <input required type="text" placeholder="CVC" className="w-full" />
          </div>
          <button type="submit" className="btn-neon w-full py-3.5 rounded-xl mt-4">
            Place order · ${total}
          </button>
        </form>

        {/* summary */}
        <div className="lg:col-span-2 glass rounded-3xl p-7 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order summary</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((i) => (
              <div key={i.id} className="flex gap-3 items-center">
                <div
                  className="w-12 h-12 rounded-lg shrink-0 grid place-items-center overflow-hidden"
                  style={{ background: i.color }}
                >
                  {i.patternUrl && <img src={i.patternUrl} alt="" className="w-9 h-9 object-contain" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{i.name}</div>
                  <div className="text-white/40 text-xs">×{i.qty}</div>
                </div>
                <div className="text-sm">${i.price * i.qty}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span>${shipping}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
