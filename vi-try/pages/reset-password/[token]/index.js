import styles from '../../../styles/reset-password.module.css';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query; // Get the token from the URL
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState(null);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const { data: session } = useSession();


  if (session) {
    router.push('/homepage');
  }

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return; 

      try {
        const res = await fetch('/api/verifyToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }), 
        });

        const data = await res.json();

        if (res.status === 400) {
          setError("Invalid Token or has been expired");
          setVerified(true);

        } else if (res.status === 200) {
          setError("");
          setVerified(true);
          setUser(data.user); 
        } else if (data.error) {
          setError(data.error);
          setVerified(true);
        }
      } catch (error) {
        console.log(error);
        setError("An error occurred. Please try again.");
      }
    };

    verifyToken();
  }, [token]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Please enter a password!");
      return;

  
    }

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, contain uppercase, lowercase, number, and special character");
      return;
    
    }

    try {
      console.log("Password:", password);

      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          email: user?.email
         }), 
      });

      const data = await res.json();

      if (res.status === 400) {
        setError("Something went wrong, try again");
     
      } 
      else if (res.status === 200) {
        setSuccess("Your password has been reset");
        window.location.href = '/login';

        setUser(data.user);
      } 
      else if (data.error) {
        setError(data.error);
        setVerified(true);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
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
        <p className={styles.login}>Reset Password</p>
        <p className={styles.text}>Enter your password!</p>

        {error && (
          <div className={styles.error}>
            <span className={styles.erroricon}>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className={styles.error}>
            <span className={styles.erroricon}>✅</span> {success}
          </div>
        )}

        <div className={styles.inputContainer}>
          <Image src="/vector_1.png" width={16} height={16} className={styles.inputIcon} alt="Password Icon" />
          <input
            onChange={(p) => setPassword(p.target.value)}
            type="password"
            placeholder="Enter your password"
            className={styles.input}
            value={password}
          />
        </div>

        <button  onClick={handleSubmit} className={styles.loginButton}>
          Submit
        </button>
      </div>
    </div>
  );
}
