import { ReactNode } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import SpaceBackground from '../SpaceBackground';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <SpaceBackground />
      <div className="z-10 relative flex flex-col min-h-screen backdrop-blur-sm bg-background/70">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
