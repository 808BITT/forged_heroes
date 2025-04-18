import { ReactNode } from 'react';
import Breadcrumbs from '../Breadcrumbs';
import SpaceBackground from '../SpaceBackground';
import Footer from './footer';
import Navbar from './navbar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <SpaceBackground />
      <div className="z-10 relative flex flex-col min-h-screen backdrop-blur-sm bg-background/70">
        <Navbar />
        <Breadcrumbs />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
