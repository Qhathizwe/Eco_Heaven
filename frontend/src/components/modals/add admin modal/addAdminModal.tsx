import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {type  AppDispatch, type RootState } from "../../../store";
import { 
    updateUserFormField, 
    createUserThunk, 
    resetUserForm, 
    getUsersThunk 
} from "../../../redux/features/userSlices";

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { form, isLoading, error } = useSelector((state: RootState) => state.user);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        dispatch(updateUserFormField({ field: name as any, value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const resultAction = await dispatch(createUserThunk(form));
        if (createUserThunk.fulfilled.match(resultAction)) {
            dispatch(getUsersThunk());
            dispatch(resetUserForm());
            onClose();
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(36, 77, 58, 0.4)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
        }}>
            <div style={{
                backgroundColor: "#f7f7f1", padding: "35px", borderRadius: "10px",
                width: "100%", maxWidth: "500px", boxShadow: "0 15px 35px rgba(36, 77, 58, 0.15)",
                border: "1px solid #e8e9e1", color: "#27382d", fontFamily: "Inter, Arial, sans-serif"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", margin: 0, color: "#244d3a" }}>
                        Register New Admin
                    </h2>
                    <button 
                        onClick={() => { dispatch(resetUserForm()); onClose(); }}
                        style={{ background: "transparent", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#858b81" }}
                    >
                        ✕
                    </button>
                </div>

                <p style={{ color: "#858b81", fontSize: "0.9rem", marginTop: 0, marginBottom: "20px" }}>
                    Create an administrative security profile with elevated system management permissions.
                </p>

                {error && (
                    <div style={{ color: "#d9534f", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "5px", marginBottom: "15px", fontSize: "0.85rem", border: "1px solid #f5c6cb" }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>FIRST NAME</label>
                            <input 
                                type="text" name="name" value={form.name} onChange={handleChange} required 
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>SURNAME</label>
                            <input 
                                type="text" name="surname" value={form.surname} onChange={handleChange} required 
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>EMAIL ADDRESS</label>
                        <input 
                            type="email" name="email" value={form.email} onChange={handleChange} required 
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>PASSWORD</label>
                            <input 
                                type="password" name="password" value={form.password} onChange={handleChange} required 
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>PHONE NUMBER</label>
                            <input 
                                type="text" name="phone" value={form.phone} onChange={handleChange} required 
                                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "5px", color: "#244d3a" }}>SYSTEM ACCESS ROLE</label>
                        <select 
                            name="role" value={form.role} onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", outline: "none" }}
                        >
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                        <button 
                            type="button" 
                            onClick={() => { dispatch(resetUserForm()); onClose(); }}
                            style={{ padding: "10px 18px", background: "transparent", border: "1px solid #dce2d8", borderRadius: "6px", cursor: "pointer", fontWeight: 600, color: "#244d3a" }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ padding: "10px 22px", background: "#244d3a", color: "#e9e395", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}
                        >
                            {isLoading ? "Provisioning..." : "Create Admin Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};