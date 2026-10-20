import LandingPage from './pages/landingPage/LandingPage'
import Register from './pages/register/RegisterPage'
import LoginPage from './pages/login/LoginPage'
import AdminDashboard from './pages/dashboards/admin/AdminDashBoard'
import UserDashboard from './pages/dashboards/user/UserDashboard'
import AccommodationDetails from './pages/accomodation/AccomodationDetails'

import ManageAccomodations from './pages/dashboards/admin/manage_admin/ManageAccomodations'
import ManageRooms from './pages/dashboards/admin/manage_admin/ManageRooms'
import ManageBookings from './pages/dashboards/admin/manage_admin/ManageBookings'
import ManageUsers from './pages/dashboards/admin/manage_admin/ManageUsers'



import { Route, Routes, } from 'react-router-dom'

import './App.css'

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage/>} />
        <Route path='/register' element={<Register />}/>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/stays/:id' element={<AccommodationDetails/>} />
        
        <Route path='/admin-dashboard' element={<AdminDashboard/>} />
        <Route path='/admin/accommodations' element={<ManageAccomodations/>} />
        <Route path='/admin/rooms' element={<ManageRooms/>} />
        <Route path='/admin/bookings' element={<ManageBookings/>} />
        <Route path='/admin/users' element={<ManageUsers/>} />

        <Route path='/user-dashboard' element={<UserDashboard/>} />
      </Routes>
    </div>
  )
}

export default App
