import { useState } from 'react'
import TopMetricsBar from './TopMetricsBar'
import MarketTabs, { type MarketTab } from './MarketTabs'
import MarketTable from './MarketTable'
import RecentActivities from './RecentActivities'
import BottomStatsBar from './BottomStatsBar'

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<MarketTab>('live')

  return (
    <div className="min-h-screen bg-wm-bg-01">
      <div className="max-w-[1440px] mx-auto px-12">
        <TopMetricsBar />
        <MarketTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <MarketTable activeTab={activeTab} />
        <RecentActivities />
        <BottomStatsBar />
      </div>
    </div>
  )
}

export default HomePage
