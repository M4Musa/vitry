import Link from 'next/link';
import styles from '../styles/ContactUs.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useRef,useEffect } from 'react';
import { useRouter } from "next/router";
import Head from 'next/head';
import Image from 'next/image';

export default function Contact() {
  const name = useRef();
  const [email,setEmail] = useState("");
  const message = useRef();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 
  const router = useRouter();
  
  useEffect(() => {
    // Get email from URL query parameter when component mounts
    if (router.query.email) {
      setEmail(router.query.email);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check if all fields are filled
    if (!name.current.value || !email || !message.current.value) {
      setError("Please fill all the fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch('/api/snedmessage', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: name.current.value,
          email: email,
          message: message.current.value 
        }),
      });

      if (res.ok) {
        setSuccess("Your query has been successfully sent!");
        // Clear the input fields upon successful submission
        name.current.value = '';
        email.current.value = '';
        message.current.value = '';
      } else {
        const errorData = await res.json(); 
        console.error("Error occurred while registering:", errorData);
        setError(errorData.error || "Error occurred while registering");
      }
    } catch (error) {
      console.error("Error occurred while registering:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us - Vision Try</title>
        <meta name="description" content="Get in touch with Vision Try for any queries or feedback" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div 
        className={styles.pageWrapper}
        style={{ 
          backgroundImage: "url('/neon-back.jpg')", 
          backgroundSize: "cover", 
          backgroundPosition: "center",
          minHeight: "100vh"
        }}
      >
        <Navbar />
        
        <div className={styles.outerContainer}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <Image src="/vi_try_logo.png" alt="Vision Try Logo" width={100} height={100} />
            </div>
          </div>
          
          <div className={styles.container}>
            <div className={styles.content}>
              <h1 className={styles.title}>Contact Us</h1>
              <p className={styles.description}>
                Have questions or feedback? Reach out to us, and we'll get back to you soon!
              </p>
              
              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠️</span> {error}
                </div>
              )}
              
              {success && (
                <div className={styles.successMessage}>
                  <span className={styles.successIcon}>✅</span> {success}
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" placeholder="Enter your name" ref={name} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input 
    type="email" 
    id="email" 
    placeholder="Enter your email" 
    value={email} // Bind state to input
    onChange={(e) => setEmail(e.target.value)} 
  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" placeholder="Write your message" ref={message}></textarea>
                </div>
                <button type="submit" className={styles.button}>
                  <span className={styles.buttonText}>Send Message</span>
                  <span className={styles.buttonGlow}></span>
                </button>
              </form>
            </div>
          </div>
          
          <section id="location" className={styles.locationSection}>
            <div className={styles.container}>
              <h2 className={styles.locationTitle}>Our Location</h2>
              <div className={styles.mapContainer}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d71193.48618375522!2d74.32782126303587!3d31.60009193239189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190460e97d35a9%3A0xb34cbe2044387a60!2sGaddafi%20Stadium!5e0!3m2!1sen!2s!4v1736210113093!5m2!1sen!2s"
                  className={styles.googleMap}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          </section>
        </div>
        
        <Footer />
      </div>
    </>
  );
}