import LandingHeader from '../components/landing/LandingHeader';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Stats from '../components/landing/Stats';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
 return (
  <div className="min-h-screen bg-surface-0">
   <LandingHeader />
   <Hero />
   <Features />
   <HowItWorks />
   <Stats />
   <CTA />
   <Footer />
  </div>
 );
}
