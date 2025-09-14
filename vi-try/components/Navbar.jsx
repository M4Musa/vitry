import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShoppingBagIcon, UserGroupIcon, PhoneIcon, PencilAltIcon, LogoutIcon } from '@heroicons/react/solid';
import { signOut, useSession } from 'next-auth/react';
import styles from './Navbar.module.css';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (isSidebarOpen && event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerItem}>
          <Image src="/sale.png" alt="Limited Time Offer" width={28} height={28} />
          <p className={styles.bannerText}>10% Discount</p>
        </div>
        <div className={styles.bannerItem}>
          <Image src="/tokenization.png" alt="Free Trials" width={28} height={28} />
          <p className={styles.bannerText}>Free Tokens</p>
        </div>
        <div className={styles.bannerItem}>
          <Image src="/fast.png" alt="Easy To Use" width={28} height={28} />
          <p className={styles.bannerText}>Easy to Use</p>
        </div>
      </div>

      <div className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image src="/vi_try_logo_text.png" alt="Logo" width={78} height={78} />
          </Link>
        </div>

        <div className={styles.navLinks}>
          <Link href="/clora" className={styles.navLink}>
            {/* <Image src="/ic_try_on_now.png"  color = "black" alt="btn" className={styles.icon} width={20} height={10} /> */}
            <span className={styles.navText}>Try-On </span>
          </Link>
          {/* <Link href="/wearable" className={styles.navLink}>
            <ShoppingBagIcon className={styles.icon} />
            <span className={styles.navText}>Wearable</span>
          </Link> */}
          <Link href="/AboutUs" className={styles.navLink}>
            {/* <UserGroupIcon className={styles.icon} /> */}
            <span className={styles.navText}>About Us</span>
          </Link>
          <Link href="/ContactUs" className={styles.navLink}>
            <PhoneIcon className={styles.icon} />
            <span className={styles.navText}></span>
          </Link>
          {/* Authentication Status */}
          {status === 'loading' ? (
            <div className={styles.authStatus}>Loading...</div>
          ) : session ? (
            <div className={styles.userInfo}>
              <span className={styles.welcomeText}>Welcome, {session.user.name || session.user.email}</span>
              <button onClick={() => signOut()} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link href="/Register" className={styles.registerButton}>
                Register
              </Link>
            </div>
          )}
          {/* <Link href="/blog" className={styles.navLink}>
            <PencilAltIcon className={styles.icon} />
            <span className={styles.navText}>Blog</span>
          </Link> */}
        </div>

        <button 
          onClick={toggleSidebar} 
          className={styles.toggleButton}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isSidebarOpen}
        >
          <Image src="/menu.png" alt="Menu" width={20} height={20} className={styles.icon} />
        </button>

      </div>

      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className={styles.sidebar} ref={sidebarRef}>
            <h2 className={styles.sidebarTitle} >Categories</h2>
            <ul className={styles.sidebarList}>
  <li className={styles.sidebarItem} onClick={() => router.push("/ProductsPage?category=Pants")}>
    Shirts/Pants
  </li>
  <li className={styles.sidebarItem} onClick={() => router.push("/ProductsPage?category=shalwar-kameez")}>
    Shalwar Kameez
  </li>
  <li className={styles.sidebarItem} onClick={() => router.push("/ProductsPage?category=pantcoats")}>
    Pantcoats
  </li>
</ul>
            <h2 className={styles.sidebarTitle}>Account</h2>
            {session ? (
              <>
                <div className={styles.sidebarUserInfo}>
                  <p className={styles.userGreeting}>Hello, {session.user.name || session.user.email}!</p>
                </div>
                <ul className={styles.sidebarList}>
                  <li className={styles.sidebarItem} onClick={() => router.push("/profile")}>Profile</li>
                  <li className={styles.sidebarItem} onClick={() => router.push("/subscription")}>
            Subscription
          </li>
                  <li className={styles.sidebarItem} onClick={() => router.push("/settings")}>
            Settings
          </li>
                  <li 
                    className={styles.sidebarItem}
                    onClick={() => signOut()}
                  >
                    Logout
                  </li>
                </ul>
              </>
            ) : (
              <ul className={styles.sidebarList}>
                <li className={styles.sidebarItem} onClick={() => router.push("/login")}>Login</li>
                <li className={styles.sidebarItem} onClick={() => router.push("/Register")}>Register</li>
              </ul>
            )}
            
            <button 
              onClick={toggleSidebar} 
              className={styles.closeButton}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;