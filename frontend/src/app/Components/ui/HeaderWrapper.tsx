'use client';

import { usePathname } from 'next/navigation';
import HeaderTop from './HeaderTop';
import HeaderMain from './HeaderMain';
import NavBar from './NavBar';

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Hide headers on auth pages and admin pages
  const hideHeaders =
    pathname === '/LoginPage' ||
    pathname === '/SignUp' ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/Admin');

  if (hideHeaders) {
    return null;
  }

  return (
    <>
      <HeaderTop />
      <HeaderMain />
      <NavBar />
    </>
  );
}
