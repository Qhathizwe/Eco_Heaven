import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "./../AdminDashBoard.module.css";
import { AddAdminModal } from "../../../../components/modals/add admin modal/addAdminModal";
import {
  getUsersThunk,
  deleteUserThunk,
  setEditingUser,
  clearUsers
} from "../../../../redux/features/userSlices";
import { type AppDispatch, type RootState } from "../../../../store";

const ManageUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Destructure required user slice properties from the typed global Redux state tree
  const { userList, isLoading, error } = useSelector((state: RootState) => state.user);

  // Pull user directory records on initialization mount
  useEffect(() => {
    dispatch(getUsersThunk());
    return () => {
      dispatch(clearUsers());
    };
  }, [dispatch]);

  // Secure removal query triggers
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this user account from the server?")) {
      dispatch(deleteUserThunk(id));
    }
  };

  // Handle opening modal for editing an existing user profile
  const handleEdit = (user: any) => {
    dispatch(setEditingUser(user));
    setIsModalOpen(true);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar Branding and Back Controls */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WildHaven</div>
        <button className={styles.backButton} onClick={() => navigate("/admin-dashboard")}>
          ← Back to Dashboard
        </button>
      </aside>

      {/* Main Application Interface Workspace */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>DIRECTORY MANAGEMENT</span>
            <h1>Manage Customer & Admin Accounts</h1>
            <p>Review system user profiles, monitor credential security clearances, and manage access roles.</p>
          </div>
          <button
            className={styles.addAccommodationBtn}
            onClick={() => {
              dispatch(setEditingUser(null)); // Flushes standard draft models clear
              setIsModalOpen(true);
            }}
          >
            + Register New Admin
          </button>
        </header>

        {/* Error Banner Alert Module */}
        {error && (
          <div style={{ color: "red", padding: "12px", backgroundColor: "#ffe6e6", borderRadius: "5px", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid #f5c6cb" }}>
            <strong>Error Alert:</strong> {error}
          </div>
        )}

        {/* Interactive Directory Listing Workspace Panel */}
        <section className={styles.notice} style={{ display: "block", background: "white", border: "1px solid #e8e9e1", borderLeft: "4px solid #27382d" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              Fetching user account directory records...
            </div>
          ) : userList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              No user accounts registered in the database yet. Click '+ Register New Admin' to add system records.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e8e9e1" }}>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>User Details</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact Info</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Access Role</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Created Date</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user: any) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #e8e9e1" }}>
                    {/* Core Name and Identifier Columns */}
                    <td style={{ padding: "12px" }}>
                      <strong style={{ color: "#27382d", fontSize: "0.98rem" }}>{user.name} {user.surname}</strong>
                      <div style={{ fontSize: "11px", color: "#666" }}>Reference ID: #{user.id}</div>
                    </td>

                    {/* Contact Email & Phone */}
                    <td style={{ padding: "12px" }}>
                      <div style={{ color: "#27382d", fontSize: "0.9rem", fontWeight: 600 }}>{user.email}</div>
                      <div style={{ fontSize: "11px", color: "#666" }}>{user.phone || "No phone provided"}</div>
                    </td>

                    {/* Operational Role Badge */}
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "5px 10px",
                        borderRadius: "30px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        backgroundColor: user.role === 'admin' ? "#e5eee3" : "#e9eee6",
                        color: user.role === 'admin' ? "#345b40" : "#52795b",
                        border: user.role === 'admin' ? "1px solid #d6e3d3" : "1px solid #dce2d8"
                      }}>
                        {user.role ? user.role.toUpperCase() : "USER"}
                      </span>
                    </td>

                    {/* Metadata Creation Date */}
                    <td style={{ padding: "12px", fontSize: "0.88rem", color: "#666" }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>

                    {/* Operation Modification Controls Matrix */}
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{ padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", background: "#f0f4ef", border: "1px solid #dce2d8", borderRadius: "4px", color: "#27382d" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{ padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", background: "#ffe6e6", border: "1px solid #f5c6cb", borderRadius: "4px", color: "#d9534f" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* Custom Overlay Dialog Interface Module */}
      <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ManageUsers;