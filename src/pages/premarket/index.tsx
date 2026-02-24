import HeroSection       from './HeroSection'
import StatsSection      from './StatsSection'
import MarketTodaySection from './MarketTodaySection'
import HowToJoinSection  from './HowToJoinSection'
import FaqSection        from './FaqSection'
import Footer            from '@/components/Footer'

const PremarketPage = () => {
  return (
    <div className="min-h-screen bg-wm-bg-01">
      <div>
        <HeroSection />
        <StatsSection />
        <MarketTodaySection />
        <HowToJoinSection />
        <FaqSection />
        <Footer />
      </div>
    </div>
  )
}

export default PremarketPage
