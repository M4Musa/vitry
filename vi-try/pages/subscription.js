import React, { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { useRouter } from 'next/router';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from '@/components/Navbar';
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const SubscriptionPage = ({ initialSubscription }) => {
  const [subscription, setSubscription] = useState(initialSubscription);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(1); // Pro is active by default (index 1)
  const [isAnimating, setIsAnimating] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const plans = [
    {
      id: "Basic",
      name: "Basic",
      price: "$9.99/month",
      color: "#ff9900",
      features: [
        "Limited items",
        "Basic filters",
        "Simple UI",
        "100 try-on tokens",
        "30 AR-based try-ons"
      ]
    },
    {
      id: "Pro",
      name: "Pro",
      price: "$19.99/month",
      color: "#00ffff",
      features: [
        "Limited items",
        "Basic filters",
        "Simple UI",
        "500 try-on tokens",
        "30 AR-based try-ons"
      ],
      popular: true
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      price: "$49.99/month",
      color: "#ff00ff",
      features: [
        "Unlimited items",
        "Advanced filters",
        "Custom UI",
        "Unlimited try-on tokens",
        "Unlimited AR-based try-ons"
      ]
    }
  ];
  
  // Check for Stripe redirect status
  useEffect(() => {
    // Don't run on server-side
    if (typeof window === 'undefined') return;
    
    // Parse URL parameters after Stripe redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    
    if (canceled) {
      alert('Payment was canceled.');
      // Clean the URL to remove query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      setProcessingPayment(false);
      return;
    }
    
    // Handle Stripe redirect with session_id
    if (sessionId) {
      setProcessingPayment(true);
      
      // Verify payment status with our API
      async function verifyPayment() {
        try {
          const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
          });
          
          const result = await response.json();
          
          if (result.success) {
            // Update the local subscription state
            setSubscription(result.subscription);
            
            // Update the NextAuth session with new subscription data
            await updateSession({
              subscription: result.subscription.status
            });
            
            // Clean the URL to remove query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show success message only once
            if (!localStorage.getItem('subscriptionSuccessShown')) {
              alert('Subscription activated successfully!');
              localStorage.setItem('subscriptionSuccessShown', 'true');
              // Clear the flag after 5 seconds
              setTimeout(() => {
                localStorage.removeItem('subscriptionSuccessShown');
              }, 5000);
            }
            
            // Refresh the page to ensure everything is up to date
            window.location.reload();
          } else {
            console.error('Payment verification failed:', result.error);
            alert('Payment verification failed: ' + (result.error || 'Unknown error'));
            setProcessingPayment(false);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Error verifying payment. Please contact support.');
          setProcessingPayment(false);
        }
      }
      
      verifyPayment();
    }
  }, [updateSession]);
  
  useEffect(() => {
    if (session?.user) {
      console.log('User Session Data:', {
        email: session.user.email,
        name: session.user.name,
        subscription: subscription,
      });
    } else {
      console.log('No user is logged in');
    }

    // Only fetch subscription if we don't have initialSubscription
    if (!initialSubscription && status === 'authenticated') {
      async function fetchSubscription() {
        try {
          const res = await fetch('/api/subscription/details');
          const data = await res.json();
          setSubscription(data.subscription);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setLoading(false);
        }
      }
      
      fetchSubscription();
    } else {
      setLoading(false);
    }

    // Add window resize event listener for responsiveness
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [session, initialSubscription, status]); // Only depend on session and initialSubscription

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      const data = await res.json();
      
      if (data.success || data.message) {
        // Show success message
        alert(data.message || 'Subscription canceled successfully.');
        
        // Update local state
        setSubscription({ package: null, status: 'canceled', expiresAt: null });
        
        // Update session with the new subscription status
        await updateSession({
          subscription: 'canceled'
        });
        
        // Short delay to ensure session update completes
        setTimeout(() => {
          // Refresh the page to ensure everything is updated
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubscription = async (packageType) => {
    if (!session?.user?.email) {
      alert('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);
    setProcessingPayment(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(error.message);
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  // Check if subscription has expired and update session
  useEffect(() => {
    if (subscription?.expiresAt && subscription.status === 'active') {
      const expiryDate = new Date(subscription.expiresAt);
      const now = new Date();
      
      if (expiryDate < now) {
        // Subscription has expired
        async function updateExpiredSubscription() {
          try {
            // Call API to update subscription status in the database
            const res = await fetch('/api/subscription/expire', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
              // Update local state
              setSubscription({ ...subscription, status: 'expired' });
              
              // Update session
              await updateSession({
                subscription: 'expired'
              });
              
              // Refresh page
              window.location.reload();
            }
          } catch (error) {
            console.error('Error updating expired subscription:', error);
          }
        }
        
        updateExpiredSubscription();
      }
    }
  }, [subscription, updateSession]);

  const handlePlanChange = (direction) => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (direction === "prev") {
      setActivePlan((prev) => (prev === 0 ? plans.length - 1 : prev - 1));
    } else {
      setActivePlan((prev) => (prev === plans.length - 1 ? 0 : prev + 1));
    }

    // Reset animation lock after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const getCardPosition = (index) => {
    // On mobile devices, show only the active card
    if (screenWidth < 768) {
      return index === activePlan ? "center" : "hidden";
    }

    if (index === activePlan) return "center";
    if ((activePlan === 0 && index === plans.length - 1) || index === activePlan - 1) return "left";
    if ((activePlan === plans.length - 1 && index === 0) || index === activePlan + 1) return "right";
    return "hidden";
  };

  const getCardWidth = () => {
    if (screenWidth < 576) return "85vw";
    if (screenWidth < 768) return "280px";
    return "300px";
  };

  const getCarouselHeight = () => {
    if (screenWidth < 576) return "500px";
    if (screenWidth < 768) return "480px";
    return "450px";
  };

  // Check if subscription has active status
  const isSubscriptionActive = subscription?.status === 'active';

  if (loading || processingPayment) return (
    <div style={{
      backgroundImage: "url('/neon-back.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      {processingPayment ? (
        <>
          <p style={{
            fontSize: "24px",
            textShadow: "0 0 10px #0ff, 0 0 20px #0ff",
            marginBottom: "20px"
          }}>Processing your payment...</p>
          <p style={{
            fontSize: "16px",
            maxWidth: "80%",
            textAlign: "center"
          }}>Please wait while we confirm your transaction with Stripe. Do not close this window.</p>
        </>
      ) : (
        <p style={{
          fontSize: "24px",
          textShadow: "0 0 10px #0ff, 0 0 20px #0ff"
        }}>Loading...</p>
      )}
    </div>
  );

  // Check if user has inactive subscription status
  if (session?.user?.subscription === "inactive") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar className="h-16" />
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
          }}>
            <h1 style={{
              fontSize: "28px",
              marginBottom: "20px",
              textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
            }}>Your Subscription is Inactive</h1>
            
            <p style={{
              fontSize: "18px",
              marginBottom: "30px",
              lineHeight: "1.6"
            }}>
              To access all features and benefits, you need an active subscription plan.
              Please visit our pricing page to choose a plan that fits your needs.
            </p>
            
            <a 
              href="/pricing" 
              style={{
                display: "inline-block",
                backgroundColor: "#4B003B",
                color: "white",
                padding: "12px 24px",
                borderRadius: "30px",
                fontSize: "18px",
                textDecoration: "none",
                boxShadow: "0 0 15px rgba(255, 0, 255, 0.5)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#9b0079"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4B003B"}
            >
              View Pricing Plans
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar className="h-16" />
      <div style={{
        backgroundImage: "url('/neon-back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: screenWidth < 576 ? "10px" : "20px",
        fontFamily: "sans-serif",
        color: "white",
        overflowX: "hidden"
      }}>
        <div style={{
          maxWidth: "1200px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <h1 style={{
            fontSize: screenWidth < 576 ? "24px" : screenWidth < 768 ? "28px" : "34px",
            textShadow: "0 0 10px #f0f, 0 0 20px #f0f",
            textAlign: "center",
            padding: screenWidth < 576 ? "0 10px" : "0"
          }}>Virtual TryOn Subscription</h1>

          {isSubscriptionActive && subscription?.package && (
            <div style={{
              marginTop: "40px",
              padding: screenWidth < 576 ? "20px" : "30px",
              borderRadius: "16px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
              width: "100%",
              maxWidth: screenWidth < 576 ? "95%" : "600px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
            }}>
              <h2 style={{
                fontSize: screenWidth < 576 ? "20px" : "24px",
                marginBottom: "20px",
                textAlign: "center",
                color: "#0ff",
                textShadow: "0 0 10px #0ff"
              }}>
                Your Current Subscription
              </h2>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px"
              }}>
                <p style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: screenWidth < 576 ? "14px" : "16px",
                  flexWrap: "wrap"
                }}>
                  <strong>Package:</strong>
                  <span>{subscription.package}</span>
                </p>

                <p style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: screenWidth < 576 ? "14px" : "16px",
                  flexWrap: "wrap"
                }}>
                  <strong>Status:</strong>
                  <span style={{
                    color: subscription.status === "active" ? "#0f0" : "#f00",
                    textShadow: subscription.status === "active" ?
                      "0 0 5px #0f0" : "0 0 5px #f00"
                  }}>
                    {subscription.status}
                  </span>
                </p>

                {subscription.expiresAt && (
                  <p style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: screenWidth < 576 ? "14px" : "16px",
                    flexWrap: "wrap"
                  }}>
                    <strong>Expires At:</strong>
                    <span>{new Date(subscription.expiresAt).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
              <div style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "center"
              }}>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    color: "white",
                    border: "2px solid #f00",
                    padding: screenWidth < 576 ? "10px 20px" : "12px 24px",
                    borderRadius: "30px",
                    fontSize: screenWidth < 576 ? "14px" : "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
                    width: screenWidth < 576 ? "100%" : "auto"
                  }}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}

          <h1 style={{
            fontSize: screenWidth < 576 ? "22px" : screenWidth < 768 ? "26px" : "30px",
            marginTop: "30px",
            marginBottom: "30px",
            textShadow: "0 0 10px #f0f, 0 0 20px #f0f",
            textAlign: "center",
            padding: screenWidth < 576 ? "0 10px" : "0"
          }}>Renew Your Subscription Plan!</h1>

          {/* Carousel Navigation Container */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: "1000px",
            position: "relative",
            minHeight: getCarouselHeight()
          }}>
            <button
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: screenWidth < 576 ? "36px" : "40px",
                height: screenWidth < 576 ? "36px" : "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                zIndex: 10,
                position: "absolute",
                left: screenWidth < 576 ? "2%" : "5%",
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)"
              }}
              onClick={() => handlePlanChange("prev")}
              aria-label="Previous plan"
            >
              <ChevronLeft size={screenWidth < 576 ? 20 : 24} color="white" />
            </button>

            <div style={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
              width: "100%",
              height: getCarouselHeight()
            }}>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  style={{
                    position: "absolute",
                    width: getCardWidth(),
                    background: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(10px)",
                    border: `2px solid ${plan.color}`,
                    borderRadius: "16px",
                    padding: screenWidth < 576 ? "20px" : "30px",
                    boxShadow: `0 0 20px ${plan.color}40`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    overflow: "hidden"
                  }}
                  initial={false}
                  animate={{
                    x: getCardPosition(index) === "center" ? "0%" :
                       getCardPosition(index) === "left" ? (screenWidth < 992 ? "-80%" : "-100%") :
                       getCardPosition(index) === "right" ? (screenWidth < 992 ? "80%" : "100%") : "0%",
                    scale: getCardPosition(index) === "center" ? 1 : screenWidth < 992 ? 0.75 : 0.8,
                    opacity: getCardPosition(index) === "hidden" ? 0 : 1,
                    rotateY: screenWidth < 768 ? 0 : (
                      getCardPosition(index) === "left" ? 15 :
                      getCardPosition(index) === "right" ? -15 : 0
                    ),
                    zIndex: getCardPosition(index) === "center" ? 3 :
                           getCardPosition(index) === "hidden" ? 0 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                  onClick={() => {
                    if (getCardPosition(index) === "left") handlePlanChange("prev");
                    if (getCardPosition(index) === "right") handlePlanChange("next");
                  }}
                >
                  {plan.popular && getCardPosition(index) === "center" && (
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      backgroundColor: "#0ff",
                      color: "#000",
                      padding: "5px 10px",
                      borderRadius: "0 0 0 10px",
                      fontWeight: "bold",
                      boxShadow: "0 0 10px #0ff",
                      transform: "rotate(45deg)",
                      width: "80px",
                      textAlign: "center",
                      fontSize: screenWidth < 576 ? "12px" : "14px"
                    }}>
                      Popular
                    </div>
                  )}

                  <h2 style={{
                    fontSize: screenWidth < 576 ? "22px" : "28px",
                    textAlign: "center",
                    marginBottom: "20px",
                    color: plan.color,
                    textShadow: `0 0 10px ${plan.color}`
                  }}>
                    {plan.name}
                  </h2>

                  <p style={{
                    fontSize: screenWidth < 576 ? "20px" : "24px",
                    textAlign: "center",
                    marginBottom: "20px",
                    fontWeight: "bold"
                  }}>
                    {plan.price}
                  </p>

                  <div style={{
                    marginBottom: "30px"
                  }}>
                    <p style={{
                      fontSize: screenWidth < 576 ? "16px" : "18px",
                      marginBottom: "15px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                      paddingBottom: "5px"
                    }}>Features:</p>

                    <ul style={{
                      listStyleType: "none",
                      padding: 0
                    }}>
                      {plan.features.map((feature, i) => (
                        <li key={i} style={{
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: screenWidth < 576 ? "14px" : "16px"
                        }}>
                          <span style={{
                            display: "inline-block",
                            width: screenWidth < 576 ? "16px" : "20px",
                            height: screenWidth < 576 ? "16px" : "20px",
                            borderRadius: "50%",
                            backgroundColor: plan.color,
                            marginRight: "10px",
                            flexShrink: 0
                          }}></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {getCardPosition(index) === "center" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        display: "flex", 
                        justifyContent: "center"
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscription(plan.id);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                          border: `2px solid ${plan.color}`,
                          padding: screenWidth < 576 ? "10px 20px" : "12px 24px",
                          borderRadius: "30px",
                          fontSize: screenWidth < 576 ? "14px" : "16px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: `0 0 15px ${plan.color}80`,
                          width: "80%"
                        }}
                      >
                        Renew Plan
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: screenWidth < 576 ? "36px" : "40px",
                height: screenWidth < 576 ? "36px" : "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                zIndex: 10,
                position: "absolute",
                right: screenWidth < 576 ? "2%" : "5%",
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)"
              }}
              onClick={() => handlePlanChange("next")}
              aria-label="Next plan"
            >
              <ChevronRight size={screenWidth < 576 ? 20 : 24} color="white" />
            </button>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            width: screenWidth < 576 ? "90%" : "100%",
            marginTop: "30px",
            maxWidth: screenWidth < 576 ? "300px" : "unset"
          }}>
            <button onClick={() => router.push("/")} style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: screenWidth < 576 ? "20px" : "24px",
              cursor: "pointer",
              width: screenWidth < 576 ? "36px" : "40px",
              height: screenWidth < 576 ? "36px" : "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid white",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
            }}>
              ←
            </button>

            <button onClick={() => router.push("/")} style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: screenWidth < 576 ? "20px" : "24px",
              cursor: "pointer",
              width: screenWidth < 576 ? "36px" : "40px",
              height: screenWidth < 576 ? "36px" : "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid white",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)"
            }}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    // Get session on server side
    const session = await getServerSession(context.req, context.res, authOptions);

    // Fetch subscription details on server if user is logged in
    let subscriptionData = null;
    if (session?.user) {
      const res = await fetch(`${process.env.NEXTAUTH_URL}/api/subscription/details`, {
        headers: {
          cookie: context.req.headers.cookie || ''
        }
      });
      subscriptionData = await res.json();
    }

    return {
      props: {
        session: session ? {
          ...session,
          user: {
            ...session.user,
            image: session.user.image || null // Fix undefined serialization error
          }
        } : null,
        initialSubscription: subscriptionData?.subscription || null
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        session: null,
        initialSubscription: null
      }
    };
  }
}

export default SubscriptionPage;