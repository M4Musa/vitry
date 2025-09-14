import { useState, useEffect } from 'react';
import Head from "next/head"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import styles from "@/styles/Pricing.module.css"


const plans = [
  {
    id: "Basic",
    name: "Basic",
    price: "per month/year",
    features: ["Limited items", "Basic filters", "Simple UI", "100 photo-based try-ons", "30 AR-based try-ons"],
  },
  {
    id: "Pro",
    name: "Pro",
    price: "per month/year",
    features: ["Limited items", "Basic filters", "Simple UI", "100 photo-based try-ons", "30 AR-based try-ons"],
  },
  {
    id: "Enterprise",
    name: "Enterprise",
    price: "per month/year",
    features: ["Limited items", "Basic filters", "Simple UI", "100 photo-based try-ons", "30 AR-based try-ons"],
  },
]

export default function PricingPage() {
  const [activePlan, setActivePlan] = useState(1) // Pro is active by default (index 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const { data: session } = useSession();
  const router = useRouter();
  const [Subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (packageType) => {
    if (!session?.user?.email) {
      alert('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');

      router.push(data.url);
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    async function fetchSubscription() {
      const res = await fetch('/api/subscription/details');
      const data = await res.json();
      setSubscription(data.subscription);
      setLoading(false);
    }
    fetchSubscription();
    console.log(Subscription);
  }, []);


  const handlePlanChange = (direction) => {
    if (isAnimating) return

    setIsAnimating(true)

    if (direction === "prev") {
      setActivePlan((prev) => (prev === 0 ? plans.length - 1 : prev - 1))
    } else {
      setActivePlan((prev) => (prev === plans.length - 1 ? 0 : prev + 1))
    }

    // Reset animation lock after animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 500)
  }

  const getCardPosition = (index) => {
    if (index === activePlan) return "center"
    if ((activePlan === 0 && index === plans.length - 1) || index === activePlan - 1) return "left"
    if ((activePlan === plans.length - 1 && index === 0) || index === activePlan + 1) return "right"
    return "hidden"
  }
  if (loading) return <p className={styles.loading}>Loading...</p>;

  if (0) {
    return (
<div style={{
      backgroundImage: "url('/neon-back.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>
      <Head>
        <title>Subscription</title>
      </Head>
      
      <div style={{
        maxWidth: "600px",
        width: "100%",
        padding: "40px",
        borderRadius: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        border: "2px solid #f0f",
        boxShadow: "0 0 30px rgba(255, 0, 255, 0.5)",
        textAlign: "center"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 0, 255, 0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 30px",
          border: "2px solid #f0f",
          boxShadow: "0 0 20px rgba(255, 0, 255, 0.5)"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#f0f" />
          </svg>
        </div>
        
        <h2 style={{
          fontSize: "30px",
          marginBottom: "20px",
          color: "#f0f",
          textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
        }}>
          Already Subscribed
        </h2>
        
        <p style={{
          fontSize: "18px",
          marginBottom: "30px",
          lineHeight: "1.6",
          color: "white"
        }}>
          You already have an active subscription. No need to subscribe again.
        </p>
        
        <button 
          onClick={() => router.push("/subscription")}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid #f0f",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 0, 255, 0.2)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 0, 255, 0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 0, 255, 0.3)";
          }}
        >
          Go to Subscription Page
        </button>
      </div>
    </div>
    );
  }
  return (
    <div 
      className={styles.container}
      style={{ backgroundImage: "url('/neon-back.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <Head>
        <title>Pricing Plans</title>
        <meta name="description" content="Choose your plan" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Image src="/vi_try_logo.png" alt="Vitry Logo" width={100} height={100} />
          </div>
        </div>

        <div className={styles.cardsContainer}>
          <button className={styles.navButton} onClick={() => handlePlanChange("prev")} aria-label="Previous plan">
            <ChevronLeft size={24} />
          </button>

          <div className={styles.cards}>
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`${styles.card} ${styles[getCardPosition(index)]}`}
                initial={false}
                animate={{
                  x: getCardPosition(index) === "left" ? "-50%" : getCardPosition(index) === "right" ? "50%" : "0%",
                  rotateY: getCardPosition(index) === "left" ? 45 : getCardPosition(index) === "right" ? -45 : 0,
                  scale: getCardPosition(index) === "center" ? 1 : 0.85,
                  opacity: getCardPosition(index) === "hidden" ? 0 : 1,
                  zIndex: getCardPosition(index) === "center" ? 3 : getCardPosition(index) === "hidden" ? 0 : 1,
                }}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  if (getCardPosition(index) === "left") handlePlanChange("prev")
                  if (getCardPosition(index) === "right") handlePlanChange("next")
                }}
              >
                <div className={styles.cardContent}>
                  <h2 className={styles.planName}>{plan.name}</h2>

                  <div className={styles.pricingSection}>
                    <h3>Price: {plan.price}</h3>
                  </div>

                  <div className={styles.featuresSection}>
                    <h3>Features:</h3>
                    <ul className={styles.featuresList}>
                      {plan.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {getCardPosition(index) === "center" && (
    <motion.button
    className={styles.selectButton}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    onClick={() => handleSubscription(plans[activePlan].id)}
    disabled={loading}
  >
    {loading ? "Processing..." : "Select Plan"}
  </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <button className={styles.navButton} onClick={() => handlePlanChange("next")} aria-label="Next plan">
            <ChevronRight size={24} />
          </button>
        </div>
      </main>
    </div>
  )
}
