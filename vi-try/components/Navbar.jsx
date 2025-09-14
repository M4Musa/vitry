import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBagIcon, UserGroupIcon, PhoneIcon, PencilAltIcon, LogoutIcon } from '@heroicons/react/solid';
import { signOut } from 'next-auth/react';
import styles from './Navbar.module.css';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
          {/* <Link href="/blog" className={styles.navLink}>
            <PencilAltIcon className={styles.icon} />
            <span className={styles.navText}>Blog</span>
          </Link> */}
        </div>

        <button onClick={toggleSidebar} className={styles.toggleButton}>
  <img src="/menu.png" alt="Menu" className={styles.icon} />
</button>

      </div>

      {isSidebarOpen && (
        <div className={styles.sidebarOverlay}>
          <div className={styles.sidebar}>
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
            
            <button onClick={toggleSidebar} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;