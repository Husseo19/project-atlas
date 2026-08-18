'use client';

import React from 'react';
import styles from './pricing.module.css';

export default function PricingPage() {
  const handleUpgrade = (tier: string) => {
    alert(`Upgrade to ${tier} initiated. (Mock functionality)`);
    console.log(`Upgrade to ${tier} initiated.`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Unlock Your Potential</h1>
        <p className={styles.subtitle}>Choose the plan that fits your learning journey.</p>
      </div>

      <div className={styles.pricingCards}>
        {/* Free Tier */}
        <div className={styles.card}>
          <h2 className={styles.tierName}>Free</h2>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>0</span>
            <span className={styles.period}>/mo</span>
          </div>
          <ul className={styles.features}>
            <li>Basic Practice Exams</li>
            <li>Limited Questions</li>
            <li>Community Support</li>
          </ul>
          <button className={styles.buttonSecondary} disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Tier */}
        <div className={`${styles.card} ${styles.cardPro}`}>
          <div className={styles.badge}>Most Popular</div>
          <h2 className={styles.tierName}>Pro</h2>
          <div className={styles.price}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>15</span>
            <span className={styles.period}>/mo</span>
          </div>
          <ul className={styles.features}>
            <li><strong>Adaptive Training Sessions</strong></li>
            <li>AI-Powered Insights</li>
            <li>Unlimited Questions</li>
            <li>Priority Support</li>
          </ul>
          <button 
            className={styles.buttonPrimary}
            onClick={() => handleUpgrade('Pro')}
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Tier */}
        <div className={styles.card}>
          <h2 className={styles.tierName}>Enterprise</h2>
          <div className={styles.price}>
            <span className={styles.contactUs}>Contact Us</span>
          </div>
          <ul className={styles.features}>
            <li>Everything in Pro</li>
            <li>Custom Certifications</li>
            <li>Team Analytics</li>
            <li>Dedicated Success Manager</li>
          </ul>
          <button 
            className={styles.buttonOutline}
            onClick={() => handleUpgrade('Enterprise')}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
