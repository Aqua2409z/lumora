import useScrollAnimations from '../hooks/useScrollAnimations'
import Header from '../sections/landing/Header'
import Hero from '../sections/landing/Hero'
import Auction from '../sections/landing/Auction'
import Proof from '../sections/landing/Proof'
import Why from '../sections/landing/Why'
import Category from '../sections/landing/Category'
import Consign from '../sections/landing/Consign'
import Sold from '../sections/landing/Sold'
import Footer from '../sections/landing/Footer'

// Giao diện chính (landing) của Lumora — ghép toàn bộ các khối theo thiết kế Figma.
export default function LandingPage() {
  useScrollAnimations() // khởi động toàn bộ GSAP ScrollTrigger cho trang này
  return (
    <div className="min-h-dvh bg-cream-light font-sans text-ink antialiased">
      <Header />
      <main>
        <Hero />
        <Auction />
        <Proof />
        <Why />
        <Category />
        <Consign />
        <Sold />
      </main>
      <Footer />
    </div>
  )
}
