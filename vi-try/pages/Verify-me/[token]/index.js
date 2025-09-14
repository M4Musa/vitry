import styles from '../../../styles/reset-password.module.css';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query; 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const { data: session } = useSession();


  if (session) {
    router.push('/homepage');
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");



    try {
      console.log(token);
      const res = await fetch(`/api/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    
      const data = await res.json();
    
      if (res.status === 400) {
        //setError("Something went wrong, try again");
      } 
      else if (res.status === 200) {
        setSuccess("Your account has been verified");
        window.location.href = '/login';
        setUser(data.user);
      } 
      else if (data.error) {
       // setError(data.error);
        setVerified(true);
      }
    } catch (error) {
      setError("Request Timeout");
    }
    
  };

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
        <p className={styles.login}>Verify Its Me</p>

        {/* {error && (
          <div className={styles.error}>
           <span className={styles.erroricon}>⚠️</span> {error}
          </div>
        )} */}

        {success && (
          <div className={styles.error}>
            <span className={styles.erroricon}>✅</span> {success}
          </div>
        )}


        <button  onClick={handleSubmit} className={styles.loginButton}>
          Verify
        </button>
      </div>
    </div>
  );
}
