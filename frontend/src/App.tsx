import LandingPage from './pages/landingPage/LandingPage'
import Register from './pages/register/Register'
import Login from './pages/login/Login'

import { Route, Routes, } from 'react-router-dom'

import './App.css'

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/register' element={<Register />}/>
        <Route path='login' element={<Login/>} />
      </Routes>
    </div>
  )
}

export default App
