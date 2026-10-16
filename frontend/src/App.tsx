import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ZaloCallback from './pages/ZaloCallback'
import { useAuth } from './lib/AuthContext'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Trang chủ landing — công khai, cả đã và chưa đăng nhập đều vào được */}
      <Route path="/" element={<LandingPage />} />
      {/* Khu vực thành viên: phải đăng nhập mới vào được */}
      <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
      {/* Trang đăng nhập/đăng ký: đã đăng nhập thì về trang chủ */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      {/* Nơi Zalo chuyển hướng về sau khi người dùng cấp quyền */}
      <Route path="/auth/zalo/callback" element={<ZaloCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
