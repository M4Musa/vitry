import Link from 'next/link';
import styles from '../styles/AboutUs.module.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - Vision Try</title>
        <meta name="description" content="Learn about Vision Try and our virtual try-on technology" />
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
        
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <Image src="/vi_try_logo.png" alt="Vision Try Logo" width={100} height={100} />
            </div>
          </div>
          
          <div className={styles.content}>
            <h1 className={styles.title}>About Us</h1>
            
            <p className={styles.description}>
              Welcome to <strong>Vision Try</strong>, your ultimate destination for exploring the future of fashion.
              We specialize in providing a seamless <strong>Virtual Try-On</strong> experience, allowing users to try on clothes through photos and videos.
            </p>
            
            <div className={styles.sections}>
              <div className={styles.card}>
                <div className={styles.cardGlow}></div>
                <h2 className={styles.cardTitle}>Our Mission</h2>
                <p>
                  At Vision Try, we aim to revolutionize the way people shop online by integrating AI and technology
                  to help users visualize outfits effortlessly. No more guesswork—see how outfits look on you in seconds.
                </p>
              </div>
              
              <div className={styles.card}>
                <div className={styles.cardGlow}></div>
                <h2 className={styles.cardTitle}>What We Offer</h2>
                <ul>
                  <li>Try-on through 2D photos and videos</li>
                  <li>Support for both casual and traditional clothing styles</li>
                  <li>Easy-to-use platform with instant results</li>
                  <li>Brand integration and exciting features for users and businesses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}