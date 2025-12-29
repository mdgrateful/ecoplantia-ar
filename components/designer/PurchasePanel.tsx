'use client';

import { useState } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

// Plant pricing (in real app, fetch from Wix/database)
const PLANT_PRICES: Record<string, number> = {
  'Lanceleaf Coreopsis': 8.99,
  'Blazingstar': 9.99,
  'Purple Lovegrass': 7.99,
  'Black-Eyed Susan': 8.99,
  'Purple Coneflower': 9.99,
  'Rough Goldenrod': 8.99,
  'Smooth Aster': 9.99,
  'Blunt Mountain-Mint': 10.99,
  'Butterfly Weed': 11.99,
};

// Rollout sheet pricing based on area
const getSheetPrice = (sqft: number): { name: string; price: number } => {
  if (sqft <= 16) return { name: 'Small Garden Kit', price: 29.99 };
  if (sqft <= 32) return { name: 'Medium Garden Kit', price: 49.99 };
  if (sqft <= 64) return { name: 'Large Garden Kit', price: 79.99 };
  return { name: 'Custom Garden Kit', price: 99.99 };
};

export default function PurchasePanel() {
  const { state, dispatch, getPlantCounts, getGardenArea } = useDesigner();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');

  const counts = getPlantCounts();
  const area = getGardenArea();
  const sheet = getSheetPrice(area);

  // Build cart items
  const cartItems = Object.entries(counts).map(([name, qty]) => ({
    name,
    quantity: qty,
    unitPrice: PLANT_PRICES[name] || 9.99,
    total: (PLANT_PRICES[name] || 9.99) * qty,
    plant: PLANTS.find(p => p.name === name),
  }));

  const plantsSubtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const sheetPrice = sheet.price;
  const subtotal = plantsSubtotal + sheetPrice;
  const taxEstimate = subtotal * 0.08; // 8% estimate
  const total = subtotal + taxEstimate;

  const handleCheckout = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout with Wix
      const response = await fetch('/api/design/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice,
            productId: item.plant?.productId,
          })),
          sheet: {
            name: sheet.name,
            price: sheetPrice,
            sqft: area,
          },
          design: {
            shape: state.shape,
            widthFt: state.widthFt,
            depthFt: state.depthFt,
            plants: state.plants,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Wix checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Complete Your Order</h2>
      </div>

      <div className={styles.panelBody}>
        {/* Cart Items */}
        <div className={styles.card}>
          <h3>Your Plants</h3>
          <div className={styles.cartItems}>
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <div key={item.name} className={styles.cartItem}>
                  <div className={styles.cartItemIcon}>
                    {item.plant?.acr || '?'}
                  </div>
                  <div className={styles.cartItemInfo}>
                    <div className={styles.cartItemName}>{item.name}</div>
                    <div className={styles.cartItemQty}>Qty: {item.quantity}</div>
                  </div>
                  <div className={styles.cartItemPrice}>
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#888', fontSize: '12px' }}>
                No plants in design
              </p>
            )}
          </div>
        </div>

        {/* Rollout Sheet */}
        <div className={styles.card}>
          <h3>Installation Kit</h3>
          <div className={styles.cartItem}>
            <div className={styles.cartItemIcon} style={{ background: '#FFE0B2', borderColor: '#FF9800' }}>
              📋
            </div>
            <div className={styles.cartItemInfo}>
              <div className={styles.cartItemName}>{sheet.name}</div>
              <div className={styles.cartItemQty}>For {Math.round(area)} sq ft garden</div>
            </div>
            <div className={styles.cartItemPrice}>
              ${sheetPrice.toFixed(2)}
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>
            Includes rollout template, planting guide, and care instructions
          </p>
        </div>

        {/* Summary */}
        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span>Plants ({Object.keys(counts).length} species)</span>
            <span>${plantsSubtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Installation Kit</span>
            <span>${sheetPrice.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Est. Tax</span>
            <span>${taxEstimate.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Email */}
        <div className={styles.card}>
          <h3>Your Email</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <p style={{ fontSize: '10px', color: '#666', marginTop: '6px' }}>
            We'll send your order confirmation and planting guide here
          </p>
        </div>

        {/* Checkout Button */}
        <button
          className={styles.checkoutBtn}
          onClick={handleCheckout}
          disabled={isProcessing || cartItems.length === 0}
        >
          {isProcessing ? 'Processing...' : `Checkout - $${total.toFixed(2)}`}
        </button>

        {/* Security Note */}
        <p style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#888',
          marginTop: '12px',
        }}>
          🔒 Secure checkout powered by Wix
        </p>
      </div>
    </div>
  );
}
