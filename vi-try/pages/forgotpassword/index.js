import styles from '../../styles/login.module.css';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link'; 
import { UseState } from 'react';
import { signIn } from 'next-auth/react'; // Import signIn from next-auth

export default function ForgotPassword() {


  const router = useRouter();
  const { data: session } = useSession(); 

  if (session) {
    router.push('/homepage');
  }


  const [email, setemail] = UseState("");
  const [error, seterror] = UseState("");
  const [success, setSuccess] = UseState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");
    setSuccess("");

    if (!email ) {
      seterror("Please Enter Your Email");
      return;
    }
    if (!emailRegex.test(email)) {
      seterror("Please enter a valid email address");
      return;
    }

    try {
      console.log("Email:", email);

      // Use NextAuth's signIn function
      const res = await fetch('/api/forget-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();


      if (res.status === 404) {
        seterror("Email not Registered ");
      }
      if (res.status === 200) {
        setSuccess("Verification Email Sent");
        setemail("");;
      }

      if (res.error) {
        seterror(res.error);
      }
    } catch (error) {
      seterror("An error occurred . Please try again.");
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
        <p className={styles.login}>Forgot Pasword</p>
        <p className={styles.text}>Reset your Password !</p>
        {error && (
          <div className={styles.error}>
            <span className={styles.erroricon}>⚠️</span> {error}
          </div>
        )}

         {success && (
          <div className={styles.error}> {/* Changed to styles.success */}
            <span className={styles.erroricon}>✅</span> {success}
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




        <button onClick={handleSubmit} className={styles.loginButton}>Submit</button>


        <p className={styles.register}>
          Go to Login Page ? 
          <Link href="/login">
            <span className={styles.reg}>login</span>
          </Link>
          </p>



      </div>
    </div>
  );
}
