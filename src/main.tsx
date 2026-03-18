import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import App from './App.tsx'
import { ExpertBookingPage } from './pages/ExpertBookingPage.tsx'
import { BookingSuccessPage } from './pages/BookingSuccessPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/expert/:expertId" element={<ExpertBookingPage />} />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
