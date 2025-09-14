import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '../contexts/SettingsContext';
import LoadingScreen from '../components/LoadingScreen';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      // Do not remove any fade class—just show the loading screen.
      setLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      <SettingsProvider>
        {loading && <LoadingScreen />}
        <Toaster position="top-center" toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#004B00',
            },
          },
          error: {
            style: {
              background: '#4B003B',
            },
          },
        }} />
        {/* Using the route as a key forces remount on navigation */}
        <div key={router.route} className="content-wrapper">
          <Component {...pageProps} />
        </div>
      </SettingsProvider>
    </SessionProvider>
  );
}




// // pages/_app.js


// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { SessionProvider } from 'next-auth/react';
// import LoadingScreen from '../components/LoadingScreen';
// import '@/styles/globals.css';

// export default function App({ Component, pageProps }) {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const handleRouteChangeStart = () => setLoading(true);
//     const handleRouteChangeComplete = () => setLoading(false);

//     router.events.on('routeChangeStart', handleRouteChangeStart);
//     router.events.on('routeChangeComplete', handleRouteChangeComplete);
//     router.events.on('routeChangeError', handleRouteChangeComplete);

//     return () => {
//       router.events.off('routeChangeStart', handleRouteChangeStart);
//       router.events.off('routeChangeComplete', handleRouteChangeComplete);
//       router.events.off('routeChangeError', handleRouteChangeComplete);
//     };
//   }, [router]);

//   return (
//     <SessionProvider session={pageProps.session}>
//       {loading && <LoadingScreen />}
//       <Component {...pageProps} />
//     </SessionProvider>
//   );
// }
