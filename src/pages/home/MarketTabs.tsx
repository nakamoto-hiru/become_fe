import { marketListItems } from '@/mock-data/home'

export type MarketTab = 'live' | 'upcoming' | 'ended'

interface MarketTabsProps {
  activeTab: MarketTab
  onTabChange: (tab: MarketTab) => void
}

const tabs: { id: MarketTab; label: string }[] = [
  { id: 'live', label: 'Live Market' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ended', label: 'Ended' },
]

const getCount = (tab: MarketTab): number => {
  if (tab === 'live') return marketListItems.filter((m) => m.status === 'live' || m.status === 'settling').length
  if (tab === 'upcoming') return marketListItems.filter((m) => m.status === 'upcoming').length
  return 128 // mock ended count
}

const MarketTabs = ({ activeTab, onTabChange }: MarketTabsProps) => (
  <div className="border-t border-wm-border-01 py-3 flex gap-6">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id
      const count = getCount(tab.id)
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex items-center gap-2 h-9 shrink-0 transition-colors"
        >
          <span
            className={`text-heading-sm ${isActive ? 'text-wm-text-01' : 'text-wm-text-03'}`}
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {tab.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-[10px] leading-[12px] font-medium uppercase ${
              isActive
                ? 'bg-wm-bg-primary text-wm-text-01'
                : 'bg-wm-bg-02 text-wm-text-02'
            }`}
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            {count}
          </span>
        </button>
      )
    })}
  </div>
)

export default MarketTabs
