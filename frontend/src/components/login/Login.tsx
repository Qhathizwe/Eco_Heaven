// import styles from './Login.module.css'

// const Login = () => {

//   return (
//     <form className={styles.LoginContainer} onSubmit={loginToHome}>
//       <div className={styles.LoginContent}>
//         <h1 className={styles.title}>
//           Please <span className={styles.tGreen}>Login</span> Your Account
//         </h1>
        
//         {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        
//         <input 
//           type="email" 
//           placeholder="Enter Your email" 
//           className={styles.loginInput} 
//           value={form.email}
//           onChange={(e) => handleChange('email', e.target.value)}
//           style={errorStyle}
//           required
//         />

//         <input 
//           type="password" 
//           placeholder="Enter Your Password" 
//           className={styles.loginInput}
//           value={form.password}
//           onChange={(e) => handleChange('password', e.target.value)}
//           style={errorStyle}
//           required 
//         />
        
//         <button 
//           type="submit"
//           className={styles.btnLogin} 
//           disabled={isLoading}
//         >
//           {isLoading ? 'Logging in...' : 'Login'}
//         </button>
        
//         <p className={styles.registerText}>
//           Don't have an account?{' '}
//           <NavLink to="/register" className={styles.Linkregister}>
//             Register
//           </NavLink>
//         </p>
//       </div>
//     </form>
//   )
// }

// export default Login
