"use client"; // Ensure this file is client-side
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Welcome from './welcome';
import Homepage from './homepage';
import LoadingScreen from '../components/LoadingScreen'; 

export default function Home() {
  const { data: session, status } = useSession(); 
  const [page, setPage] = useState("nothing");

  useEffect(() => {
    if (status === 'loading') return; 
    if (session) {
      setPage("Home");
    } else {
      setPage("Welcome");
    }
  }, [session, status]);

  if (page === "nothing") {
    return <LoadingScreen />; 
  }

  return page === "Home" ? <Homepage /> : <Welcome />;
}
