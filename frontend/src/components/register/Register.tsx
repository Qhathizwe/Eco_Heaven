import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../register/Register.module.css';
import { type AppDispatch, type RootState } from '../../store';
import { type user_role } from '../../types/app.types';
import {
    AddName,
    AddSurname,
    AddPhone,
    AddEmailAddress,
    AddPassword,
    AddRole,
    RegisterThunk,
} from '../../redux/features/registerSlice'; 

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Grab registration form data and status from Redux state
    const { name, surname, phone, email, password, role, isLoading } = useSelector(
        (state: RootState) => state.register
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("🚀 Form submitted! Current form state:", { name, surname, email, phone, password, role });

    // 1. Check if any fields are failing validation
    if (
        !name?.trim() ||
        !surname?.trim() ||
        !email?.trim() ||
        !phone?.trim() ||
        !password?.trim() ||
        !role?.trim()
    ) {
        console.log("❌ Validation failed. One or more fields are empty or only spaces.");
        alert("All fields are required.");
        return;
    }

    console.log("⏳ Dispatching RegisterThunk...");
    
    // 2. Trigger the async Thunk request
    const result = await dispatch(
        RegisterThunk({
            name,
            surname,
            email,
            password,
            phone,
            role,
        })
    );

    console.log("📦 Thunk Result received:", result);

    // 3. Handle success or failure explicitly
    if (RegisterThunk.fulfilled.match(result)) {
        console.log("✅ Registration successful!");
        alert("Registration successful");
        navigate("/");
    } else if (RegisterThunk.rejected.match(result)) {
        console.error("❌ Thunk Rejected! Error info:", result.error || result.payload);
        alert(`Registration failed: ${result.error?.message || "Unknown error occurred"}`);
    }
};


    return (
        <div className={styles.register}>
            <form className={styles.content} onSubmit={handleSubmit}>
                <h1 className={styles.title}>
                    Please <span className={styles.titleGreen}>Register</span> Your Account
                </h1>

                <div className={styles.nameSurname}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        className={styles.inputHalf} 
                        value={name}
                        onChange={(e) => dispatch(AddName(e.target.value))}
                        required 
                    />
                    <input 
                        type="text" 
                        name="surname" 
                        placeholder="Surname" 
                        className={styles.inputHalf} 
                        value={surname}
                        onChange={(e) => dispatch(AddSurname(e.target.value))}
                        required 
                    />
                </div>

                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    className={styles.inputFull} 
                    value={email}
                    onChange={(e) => dispatch(AddEmailAddress(e.target.value))}
                    required 
                />
                <input 
                    type="text" 
                    name="phone" 
                    placeholder="Phone" 
                    className={styles.inputFull} 
                    value={phone}
                    onChange={(e) => dispatch(AddPhone(e.target.value))}
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    className={styles.inputFull} 
                    value={password}
                    onChange={(e) => dispatch(AddPassword(e.target.value))}
                    required 
                />
                
                {/* Replaced input with dropdown to guarantee correct user_role type alignment */}
                <select 
                    name="role" 
                    className={styles.inputFull} 
                    value={role}
                    onChange={(e) => dispatch(AddRole(e.target.value as user_role))}
                    required
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button type="submit" className={styles.btnRegister} disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>

                <p className={styles.loginText}>
                    Already a member? <NavLink to="/" className={styles.linkLogin}>Login</NavLink>
                </p>
            </form>
        </div>
    );
};

export default Register;
