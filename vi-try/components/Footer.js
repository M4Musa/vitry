import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/router";
import { useState } from 'react';


const Footer = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmailSubmit = () => {
    // Check if email is valid
    if (email && email.includes('@')) {
      // Push to contact page with email as query parameter
      router.push(`/ContactUs?email=${encodeURIComponent(email)}`);
    } else {
      // Optional: Show validation error
      alert('Please enter a valid email address');
    }
  };
  return (
    <footer className="bg-pink-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-start">
          {/* Logo and Email Input */}
          <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <Image 
              src="/vi_try_logo.png" 
              alt="Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12 mb-4" 
            />
    <div className="flex items-center bg-pink-950 border-2 border-rose-200 rounded-full p-1 max-w-xs">
      <input
        type="email"
        placeholder="Send an email to us"
        className="bg-transparent outline-none flex-grow px-4 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button 
        className="bg-yellow-400 rounded-full p-2" 
        onClick={handleEmailSubmit}
      >
        <ArrowRight className="w-5 h-5 text-purple-900" />
      </button>
    </div>
    <div className="flex mt-4 space-x-2">
  {/* Facebook */}
  <Link href="https://www.facebook.com/profile.php?id=61574020700122" className="bg-rose-200 rounded-full p-2" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  </Link>

  {/* Twitter (Same as Instagram link given) */}
  <Link href="https://www.instagram.com/virtual.tryon/" className="bg-rose-200 rounded-full p-2" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  </Link>

  {/* Instagram */}
  <Link href="https://www.instagram.com/virtual.tryon/" className="bg-rose-200 rounded-full p-2" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  </Link>

  {/* Email */}
  <Link href="mailto:vi.try0110@gmail.com" className="bg-rose-200 rounded-full p-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
      <polyline points="3 7 12 13 21 7"></polyline>
    </svg>
  </Link>
</div>

          </div>

          <div className="w-full md:w-1/2 flex justify-end">
            {/* Information Links */}
            <div className="w-1/2 mb-6 md:mb-0 pr-4">
              <h3 className="font-bold mb-4">Information</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing">Pricing Page</Link></li>
                <li><Link href="/AboutUs">About Us</Link></li>
                <li><Link href="#">Functionalities</Link></li>
                <li><Link href="#">Models</Link></li>
              </ul>
            </div>

            {/* Company Details */}
            <div className="w-1/2">
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/ContactUs#location">Location</Link></li>
                <li><Link href="#">Admins</Link></li>
                <li>Lahore, Pakistan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-rose-200 border-dashed">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <p>© VI Try 2024</p>
          <div className="flex items-center space-x-2">
            <Image 
            src={'/Pakistan_flag.png'}
            alt={'Pakistan'}
            width={30}
            height={30}
            />
            <span>🇵🇰 Pakistan</span>
            <select className="bg-transparent border-none">
              <option>PKR</option>
              {/* Add other currency options as needed */}
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
