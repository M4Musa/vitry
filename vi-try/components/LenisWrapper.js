import React from 'react';
import { ReactLenis } from 'lenis/react';

export { ReactLenis };

export default function LenisWrapper({ children }) {
  return <ReactLenis root>{children}</ReactLenis>;
}
