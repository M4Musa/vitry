import React from 'react';
import { useRouter } from 'next/router';
import Link from "next/link";
import MagneticButton from '@/components/MagneticButton';

const Custom404 = () => {
  const router = useRouter();
  
  const handleSubmit = () => {
    router.push("/");
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
            <path d="M12 4c-4.42 0-8 3.58-8 8 0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f0f" />
          </svg>
        </div>
        
        <h1 style={{
          fontSize: "80px",
          marginBottom: "10px",
          color: "#f0f",
          textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: "30px",
          marginBottom: "20px",
          color: "white",
          textShadow: "0 0 10px #f0f, 0 0 20px #f0f"
        }}>
          Oops! Page Not Found
        </h2>
        
        <p style={{
          fontSize: "18px",
          marginBottom: "40px",
          lineHeight: "1.6"
        }}>
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div style={{
          display: "flex",
          justifyContent: "center"
        }}>
    <button 
      onClick={() => router.push('/')}
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
    >
      Go Back to Home
    </button>
        </div>
      </div>
    </div>
  );
};

export default Custom404;