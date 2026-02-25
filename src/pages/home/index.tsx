import TopMetricsBar from './TopMetricsBar'
import MarketSection from './MarketSection'
import RecentActivities from './RecentActivities'
import BottomStatsBar from './BottomStatsBar'

const HomePage = () => (
  <div className="min-h-screen bg-wm-bg-01">
    <div className="max-w-[1440px] mx-auto px-12 py-4 gap-4 flex flex-col">
      <TopMetricsBar />
      <MarketSection />
      <RecentActivities />
      <BottomStatsBar />
    </div>
  </div>
)

export default HomePage
