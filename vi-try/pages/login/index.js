import styles from '../../styles/login.module.css';
import { useSession } from 'next-auth/react'; 
import Image from 'next/image';
import Link from 'next/link'; 
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react'; // Import signIn from next-auth
import MagneticButton from '@/components/MagneticButton';

export default function Login() {

  const router = useRouter();

  const { data: session } = useSession(); 

  if (session) {
    router.push('/homepage');
  }


  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");



  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");

    if (!email || !password) {
      seterror("Please fill all the fields");
      return;
    }

    try {
      console.log("Email:", email);
      console.log("Password:", password);

      // Use NextAuth's signIn function
      const res = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });
      if (res.ok) {
        router.push('/homepage');

      }

      if (res.error) {
        seterror(res.error);
      } else {
        // Redirect or handle successful login
        // You can redirect to the dashboard or another page here
        window.location.href = '/homepage'; // Change this to your desired redirect
      }
    } catch (error) {
      seterror("An error occurred during login. Please try again.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image
          src="/image_35.png" 
          alt="Welcome Image"
          layout="fill" 
          objectFit="cover" 
          className={styles.image}
        />
      </div>

      <div className={styles.overlay}>
        <p className={styles.login}>Login</p>
        <p className={styles.text}>Login to Log Into Future!</p>
        {error && (
          <div className={styles.error}>
            <span className={styles.erroricon}>⚠️</span> {error}
          </div>
        )}

        <p className={styles.text1}>Email</p>
        <div className={styles.inputContainer}>
          <img src="/vector.png" className={styles.inputIcon} alt="Email Icon" />
          <input 
            onChange={e => setemail(e.target.value)}
            type="text" 
            placeholder="Ex: abc@example.com" 
            className={styles.input} 
          />
        </div>

        <p className={styles.text1}>Your Password</p>
        <div className={styles.inputContainer}>
          <img src="/vector_1.png" className={styles.inputIcon} alt="Password Icon" />
          <input 
            onChange={p => setpassword(p.target.value)}
            type="password" 
            placeholder="Enter your password" 
            className={styles.input} 
          />
        </div>

        <Link href="/forgotpassword" className={styles.forgotPassword}>
          <span className={styles.forgotPassword}> Forgot Password? </span>
        </Link>

        <MagneticButton onClick={handleSubmit} customStyle={true} customClass={styles.loginButton} className={styles.loginButton}>Login</MagneticButton>

        <div className={styles.divider}></div>

        <MagneticButton customStyle={true} customClass={styles.googleButton} className={styles.googleButton}>
          <Image
            src="/logo.png" 
            alt="Google Logo"
            width={20} 
            height={20} 
            className={styles.icon} 
          />
          Continue with Google
        </MagneticButton>

        <p className={styles.register}>
          Don't have an account? 
          <Link href="/Register">
            <span className={styles.reg}>Register</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
