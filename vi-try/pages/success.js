import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simulating fetching plan details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // In a real app, you might get this from URL params or context
        const plan = router.query.plan || 'pro';
        
        // Simulate API call
        setTimeout(() => {
          setPlanDetails({
            name: plan.charAt(0).toUpperCase() + plan.slice(1),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            price: plan === 'basic' ? '$9.99/month' : 
                   plan === 'pro' ? '$19.99/month' : '$49.99/month'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [router.query.plan]);
  
  const goToHome = () => {
    router.push('/');
  };
  
  if (loading) {
    return (
      <div style={{
        backgroundImage: "url('/neon-back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "sans-serif"
      }}>
        <p style={{
          fontSize: "24px",
          textShadow: "0 0 10px #0ff, 0 0 20px #0ff"
        }}>Loading...</p>
      </div>
    );
  }
  
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
      fontFamily: "sans-serif",
      color: "white"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        padding: "40px",
        borderRadius: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        border: "2px solid #0ff",
        boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
        textAlign: "center"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(0, 255, 0, 0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 30px",
          border: "2px solid #0f0",
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#0f0" />
          </svg>
        </div>
        
        <h1 style={{
          fontSize: "36px",
          marginBottom: "20px",
          color: "#0ff",
          textShadow: "0 0 10px #0ff, 0 0 20px #0ff"
        }}>
          Subscription Successful!
        </h1>
        
        <p style={{
          fontSize: "18px",
          marginBottom: "30px",
          lineHeight: "1.6"
        }}>
          Thank you for subscribing to our {planDetails?.name} plan. Your virtual wardrobe experience has been upgraded!
        </p>
        
        <div style={{
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          marginBottom: "30px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            padding: "10px 0",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <span>Plan:</span>
            <span style={{
              fontWeight: "bold",
              color: "#0ff"
            }}>{planDetails?.name}</span>
          </div>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            padding: "10px 0",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <span>Price:</span>
            <span style={{
              fontWeight: "bold"
            }}>{planDetails?.price}</span>
          </div>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0"
          }}>
            <span>Next billing date:</span>
            <span style={{
              fontWeight: "bold"
            }}>{new Date(planDetails?.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <p style={{
          fontSize: "16px",
          marginBottom: "30px",
          opacity: "0.8"
        }}>
          A confirmation email has been sent to your registered email address.
        </p>
        
        <button 
          onClick={goToHome}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid #0ff",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)"
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}