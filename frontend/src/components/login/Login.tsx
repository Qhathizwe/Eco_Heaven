import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Login.module.css';
import { type AppDispatch, type RootState } from '../../store';
import { updateLoginField, loginUserThunk } from '../../redux/features/loginSlice';
import AddRole from '../../redux/features/registerSlice'
import { type user_role } from '../../types/app.types';


const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { role } = useSelector(
        (state: RootState) => state.register
    )

    // Bind directly to your exact Redux Slice state fields
    const { form, isLoading, error } = useSelector((state: RootState) => state.login);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('⏳ Attempting authentication with:', form);

        // Dispatch your exact pipeline thunk with the current Redux credentials state
        const result = await dispatch(loginUserThunk(form));

        console.log('Login response package:', result);

        if (loginUserThunk.fulfilled.match(result)) {
            console.log(' Auth lifecycle complete.');
            alert('Welcome back!');

            navigate('/dashboard');
            // 👈 Change this to your authenticated route
        } else if (loginUserThunk.rejected.match(result)) {
            console.error(' Authentication aborted:', result.payload || result.error.message);
            alert(`Login failed: ${result.payload || "Faka izimfaneko zakhona!"}`);
        }
    };

    return (
        <form className={styles.LoginContainer} onSubmit={handleSubmit}>
            <div className={styles.LoginContent}>
                <h1 className={styles.title}>
                    Please <span className={styles.tGreen}>Login</span> Your Account
                </h1>

                {/* Displays the server errors or custom Zulu exception messages from your slice */}
                {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}

                <input
                    type="email"
                    placeholder="Enter Your email"
                    className={styles.loginInput}
                    value={form.email}
                    // FIX: Wrapped the arguments correctly into a single object payload or matched your slice
                    onChange={(e) => dispatch(updateLoginField({ field: 'email', value: e.target.value }))}
                    required
                />

                <input
                    type="password"
                    placeholder="Enter Your Password"
                    className={styles.loginInput}
                    value={form.password}
                    // FIX: Wrapped the arguments correctly into a single object payload or matched your slice
                    onChange={(e) => dispatch(updateLoginField({ field: 'password', value: e.target.value }))}
                    required
                />


                <select
                    name="role"
                    className={styles.inputFull}
                    value={form.role} // Tied directly to the login slice form state now
                    onChange={(e) => dispatch(updateLoginField({ field: 'role', value: e.target.value as user_role }))}
                    required
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    className={styles.btnLogin}
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>

                <p className={styles.registerText}>
                    Don't have an account?{' '}
                    <Link to="/register" className={styles.Linkregister}>
                        Register
                    </Link>
                </p>
            </div>
        </form>
    );
};

export default Login;
