import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedPrompts from "@/components/FeaturedPrompts";
import CategoriesSection from "@/components/CategoriesSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturedPrompts />
        <CategoriesSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
