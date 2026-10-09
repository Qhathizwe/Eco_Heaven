import styles from './Navbar.module.css'
import logo from '../../assets/hotel-logo 2.jpg'

import { useNavigate } from 'react-router-dom'


const Navbar = () => {
  const navigate = useNavigate()

  return (
     <div className={styles.NavbarContainer}>
      <img src={logo} alt="Logo" className={styles.Logo} />

      <a href="#stays" className={styles.NavLink}>Stays</a>
      <a href="#philosophy" className={styles.NavLink}>Our Philosophy</a>

      <button onClick={() => navigate('/login')} className={styles.SignInButton}>Sign in</button>
    </div>
  )
}

export default Navbar
