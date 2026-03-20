import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import App from './App.tsx'
import { ExpertBookingPage } from './pages/ExpertBookingPage.tsx'
import { BookingSuccessPage } from './pages/BookingSuccessPage.tsx'
import { TopicViewPage } from './pages/TopicViewPage.tsx'
import { ResearchPage } from './pages/ResearchPage.tsx'
import { CompanionPage } from './pages/CompanionPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/schedule/:expertId" element={<ExpertBookingPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
        <Route path="/topic/:topicId" element={<TopicViewPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/companion" element={<CompanionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
