// pages/welcome.js
import { useSession } from 'next-auth/react'; 
import styles from '../../styles/welcome.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function Welcome() {
  const router = useRouter();
  const { data: session, status } = useSession(); 

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/homepage');
    }
  }, [session, status, router]);

  // Function to handle Google sign-in
  const handleGoogleSignIn = async () => {

    console.log("has to implementred");
  };

  const handleRegisterClick = () => {
    router.push('/Register');
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image
          src="/image_33.png" 
          alt="Welcome Image"
          layout="fill" 
          objectFit="cover" 
          className={styles.image}
        />
      </div>

      <div className={styles.overlay}>
        <div className={styles.logoContainer}>
          <Image
            src="/image_31.png" 
            alt="Logo"
            width={200} 
            height={200} 
            className={styles.logo}
          />
        </div>
        <p className={styles.welcome1}>Welcome to </p>
        <h1 className={styles.welcome}>Vi Try</h1>
        <p className={styles.welcome2}>
          A place where your Fashion Vision comes to <span className={styles.life}>Life!</span>
        </p>
        <p className={styles.text1}>Let’s Get Started...</p>

        <button onClick={handleGoogleSignIn} className={styles.button}>
          <Image
            src="/Logo.png" 
            alt="Google Logo"
            width={20} 
            height={20} 
            className={styles.icon} 
          />
          Continue with Google
        </button>
        
        <button onClick={handleRegisterClick} className={styles.button}>
          Continue with Email   
          <Image
            src="/Vector.png" 
            alt="Email Logo"
            width={20} 
            height={20} 
            className={styles.icon1} 
          />
        </button>

        <p className={styles.text}>
          Already have an account?{' '}
          <Link href="/login">
            <span className={styles.text2}>Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
