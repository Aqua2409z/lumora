import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/AuthContext'
import SmoothScrollProvider from './providers/SmoothScrollProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SmoothScrollProvider>
          <App />
        </SmoothScrollProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
