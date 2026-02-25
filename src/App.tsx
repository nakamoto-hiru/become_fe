import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout              from '@/layouts/AppLayout'
import PremarketPage          from '@/pages/premarket'
import HomePage               from '@/pages/home'
import UnderDevelopmentPage   from '@/pages/UnderDevelopmentPage'
import ButtonDemo             from '@/pages/ButtonDemo'
import InputDemo              from '@/pages/InputDemo'
import CheckboxDemo           from '@/pages/CheckboxDemo'
import NotFoundPage           from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All pages share the global Navbar via AppLayout */}
        <Route element={<AppLayout />}>
          {/* ── Main pages ────────────────────────────────────────────── */}
          <Route path="/"                    element={<HomePage />} />
          <Route path="/premarket"           element={<PremarketPage />} />
          <Route path="/premarket/:slug"     element={<UnderDevelopmentPage />} />

          {/* ── Navbar routes — placeholder until built ───────────────── */}
          <Route path="/dashboard"        element={<UnderDevelopmentPage />} />
          <Route path="/dashboard/*"      element={<UnderDevelopmentPage />} />
          <Route path="/earn"             element={<UnderDevelopmentPage />} />
          <Route path="/earn/*"           element={<UnderDevelopmentPage />} />
          <Route path="/resources"        element={<UnderDevelopmentPage />} />
          <Route path="/resources/*"      element={<UnderDevelopmentPage />} />

          {/* ── Demo pages ────────────────────────────────────────────── */}
          <Route path="/demo/buttons"     element={<ButtonDemo />} />
          <Route path="/demo/inputs"      element={<InputDemo />} />
          <Route path="/demo/checkboxes"  element={<CheckboxDemo />} />

          {/* ── Fallback ──────────────────────────────────────────────── */}
          <Route path="*"                 element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
