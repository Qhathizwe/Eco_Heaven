import Navbar from "../../components/navbar/Navbar"
import styles from './LandingPage.module.css'
import hero from '../../assets/hero-image.jpg'


const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.LandingPageContainer}>
        <div className={styles.LandingPageContent}>
            <img src={hero} alt="Hero" />   

      </div>
    </div>
    </div>
  )
}

export default LandingPage
