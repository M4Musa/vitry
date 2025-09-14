import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SubscriptionCancel() {
  const router = useRouter();
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simulating fetching subscription details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setSubscriptionDetails({
            name: 'Pro',
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            refundAmount: '$14.99'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching cancellation details:', error);
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, []);
  
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
          textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
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
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#f0f" />
          </svg>
        </div>
        
        <h1 style={{
          fontSize: "36px",
          marginBottom: "20px",
          color: "#f0f",
          textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
        }}>
          Subscription Cancelled
        </h1>
        
        <p style={{
          fontSize: "18px",
          marginBottom: "30px",
          lineHeight: "1.6"
        }}>
          Your {subscriptionDetails?.name} subscription has been successfully cancelled. We're sorry to see you go!
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
            <span>Service available until:</span>
            <span style={{
              fontWeight: "bold",
              color: "#f0f"
            }}>{new Date(subscriptionDetails?.endDate).toLocaleDateString()}</span>
          </div>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0"
          }}>
            <span>Refund amount:</span>
            <span style={{
              fontWeight: "bold"
            }}>{subscriptionDetails?.refundAmount}</span>
          </div>
        </div>
        
        <div style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          border: "1px dashed rgba(255, 255, 255, 0.3)"
        }}>
          <h3 style={{
            fontSize: "18px",
            marginBottom: "10px",
            color: "#f0f"
          }}>
            We'd love to know why you're leaving
          </h3>
          <p style={{
            fontSize: "14px",
            marginBottom: "15px",
            opacity: "0.8"
          }}>
            Please help us improve by sharing your feedback
          </p>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center"
          }}>
            {["Too expensive", "Not enough features", "Found a better alternative", "Just trying it out"].map(reason => (
              <button key={reason} style={{
                backgroundColor: "rgba(255, 0, 255, 0.1)",
                border: "1px solid #f0f",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                cursor: "pointer"
              }}>
                {reason}
              </button>
            ))}
          </div>
        </div>
        
        <p style={{
          fontSize: "16px",
          marginBottom: "30px",
          opacity: "0.8"
        }}>
          A confirmation email has been sent to your registered email address.
        </p>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px"
        }}>
          <button 
            onClick={goToHome}
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
              boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)",
              width: "100%"
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}