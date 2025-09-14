"use client"; 
import styles from '../../styles/Register.module.css';
import { useSession } from 'next-auth/react'; 
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Register() {
  const router = useRouter();
  const { data: session, status } = useSession(); 

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/homepage');
    }
  }, [session, status, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill all the fields");
      return;
    }

    // Email validation
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, contain uppercase, lowercase, number, and special character");
      return;
    }

    try {



      const res = await fetch('/api/register', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password 
        }),
      });

      if (res.ok) {
        console.log("Registration successful");
        setEmail("");
        setName("");
        setPassword("");
        setSuccess("A verification email has been sent !");
      } else {
        const errorData = await res.json(); 
        console.error("Error occurred while registering:", errorData);
        setError(errorData.error || "Error occurred while registering");
      }
    } catch (error) {
      setError("Error occurred while registering. Please try again.");
      console.error("Error occurred while registering:", error);
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
        <div className={styles.logoContainer}>
          <Image
            src="/image_31.png"
            alt="Logo"
            width={200} 
            height={200} 
            className={styles.logo}
          />
        </div>

        <p className={styles.Register}>Register</p>
        <p className={styles.text}>
          Create an <span className={styles.highlight}><b>account</b></span> to access all the features of <span className={styles.highlight1}><b>VI TRY!</b></span>
        </p>

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
          <Image src="/Vector_2.png" width={16} height={16} className={styles.inputIcon} alt="Email Icon" />
          <input 
            onChange={e => setEmail(e.target.value)}
            type="text" 
            placeholder="Ex: abc@example.com" 
            className={styles.input} 
            value={email} // Control the input value
          />
        </div>

        <p className={styles.text2}>Your Name</p>
        <div className={styles.inputContainer}>
          <Image src="/Vector_3.png" width={16} height={16} className={styles.inputIcon} alt="Name Icon" />
          <input 
            onChange={n => setName(n.target.value)}
            type="text" 
            placeholder="Ex. Vi try" 
            className={styles.input} 
            value={name} // Control the input value
          />
        </div>

        <p className={styles.text2}>Your Password</p>
        <div className={styles.inputContainer}>
          <Image src="/vector_1.png" width={16} height={16} className={styles.inputIcon} alt="Password Icon" />
          <input 
            onChange={p => setPassword(p.target.value)}
            type="password" 
            placeholder="Enter your password" 
            className={styles.input} 
            value={password} 
          />
        </div>

        <button onClick={handleSubmit} className={styles.RegisterButton}>Register</button>

        <p className={styles.register}>
          Already have an account? 
          <Link href="/login">
            <span className={styles.reg}>Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
}