import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "./../AdminDashBoard.module.css";
import { AddAccommodationModal } from "../../../../components/modals/add accomodation modal/AddAccommodationModal";
import {
    getAccomodationsThunk,
    deleteAccomodationThunk,
    setEditingAccomodation // Added missing action import
} from "../../../../redux/features/accomodationSlice";
import { type AppDispatch, type RootState } from '../../../../store';

const ManageAccommodations = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pulling slice datasets out of the typed Redux Store
    const { accomodationList, isLoading, error } = useSelector((state: RootState) => state.accomodation);

    // Fetch accommodations dataset from backend database on mount
    useEffect(() => {
        dispatch(getAccomodationsThunk());
    }, [dispatch]);

    // Handle profile entity deletion queries safely
    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this accommodation?")) {
            dispatch(deleteAccomodationThunk(id));
        }
    };

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>WildHaven</div>
                <button className={styles.backButton} onClick={() => navigate("/admin-dashboard")}>
                    ← Back to Dashboard
                </button>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <span className={styles.eyebrow}>OPERATIONS</span>
                        <h1>Manage Accommodations</h1>
                        <p>View, modify, or add new properties to your listing.</p>
                    </div>
                    <button
                        className={styles.addAccommodationBtn}
                        onClick={() => {
                            dispatch(setEditingAccomodation(null)); // Ensures form clears when creating a fresh listing
                            setIsModalOpen(true);
                        }}
                    >
                        + Add Accommodation
                    </button>
                </header>

                {/* Display Error Message Banner if API fails */}
                {error && (
                    <div style={{ color: "red", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px", marginBottom: "15px" }}>
                        Error: {error}
                    </div>
                )}

                <section className={styles.notice}>
                    {isLoading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>Loading properties...</div>
                    ) : accomodationList.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>No accommodations found. Click '+ Add Accommodation' to create one.</div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #eee" }}>
                                    <th style={{ padding: "12px" }}>Preview</th>
                                    <th style={{ padding: "12px" }}>Name</th>
                                    <th style={{ padding: "12px" }}>Province</th>
                                    <th style={{ padding: "12px" }}>Rating</th>
                                    <th style={{ padding: "12px" }}>Amenities</th>
                                    <th style={{ padding: "12px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accomodationList.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "12px" }}>
                                            {item.pictures && item.pictures.length > 0 ? (
                                                <img
                                                    src={item.pictures && item.pictures.length > 0 ? item.pictures[0] : 'placeholder-image-url.jpg'}
                                                    alt={item.name}
                                                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                                />

                                            ) : (
                                                <div style={{ width: "50px", height: "50px", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#888", borderRadius: "4px" }}>No Image</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <strong>{item.name}</strong>
                                            <div style={{ fontSize: "12px", color: "#666" }}>{item.address}</div>
                                        </td>
                                        <td style={{ padding: "12px" }}>{item.province}</td>
                                        <td style={{ padding: "12px" }}><span style={{ color: "#f39c12" }}>★</span> {item.star_rating}</td>
                                        <td style={{ padding: "12px" }}>
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {item.amenities?.map((amenity, index) => (
                                                    <span key={index} style={{ backgroundColor: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <button
                                                style={{ marginRight: "10px", background: "none", border: "none", cursor: "pointer", color: "#007bff" }}
                                                onClick={() => {
                                                    dispatch(setEditingAccomodation(item)); // Populates fields into slice state
                                                    setIsModalOpen(true); // Triggers edit dialog workspace
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "red" }}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>

            <AddAccommodationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ManageAccommodations;
