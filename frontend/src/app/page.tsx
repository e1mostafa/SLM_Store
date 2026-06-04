import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BannerStrip from '@/components/home/BannerStrip';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import TrustBadges from '@/components/home/TrustBadges';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="max-w-[1500px] mx-auto px-4">
          <TrustBadges />
          <CategoriesSection />
          <FlashSaleSection />
          <FeaturedProducts />
          <BannerStrip />
          <Suspense fallback={null}>
            <RecentlyViewed />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
