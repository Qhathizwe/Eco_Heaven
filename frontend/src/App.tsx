import LandingPage from './pages/landingPage/LandingPage'
import Register from './pages/register/RegisterPage'
import LoginPage from './pages/login/LoginPage'

import { Route, Routes, } from 'react-router-dom'

import './App.css'

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/register' element={<Register />}/>
        <Route path='login' element={<LoginPage/>} />
      </Routes>
    </div>
  )
}

export default App
