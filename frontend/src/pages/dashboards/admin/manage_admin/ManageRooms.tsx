import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "./../AdminDashBoard.module.css";
import { AddRoomModal } from "../../../../components/modals/add room modal/addRoomModal";
import {
  getRoomsByAccommodationThunk,
  deleteRoomThunk,
  setEditingRoom,
  clearRooms
} from "../../../../redux/features/roomSlice";
import { getAccomodationsThunk } from "../../../../redux/features/accomodationSlice";
import { type AppDispatch, type RootState } from '../../../../store';

const ManageRooms = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<number | string>("");

  // Destructure required slices from the typed global Redux state tree
  const { roomList, isLoading, error } = useSelector((state: RootState) => state.room);
  const { accomodationList } = useSelector((state: RootState) => state.accomodation);

  // Pull parent accommodation assets on initialization mount
  useEffect(() => {
    dispatch(getAccomodationsThunk());
  }, [dispatch]);

  // Automatically trigger updates or clear memory when selection state shifts
  useEffect(() => {
    if (selectedAccommodationId) {
      dispatch(getRoomsByAccommodationThunk(selectedAccommodationId));
    } else {
      dispatch(clearRooms());
    }
  }, [selectedAccommodationId, dispatch]);

  // Secure removal query triggers
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this room layout from the server?")) {
      dispatch(deleteRoomThunk(id));
    }
  };

  // Handle opening modal for editing an existing room
  const handleEdit = (room: any) => {
    dispatch(setEditingRoom(room));
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
            <span className={styles.eyebrow}>OPERATIONS</span>
            <h1>Manage Inventory Rooms</h1>
            <p>Configure pricing models, feature photos, and internal layout availability statuses.</p>
          </div>
          <button
            className={styles.addAccommodationBtn}
            disabled={!selectedAccommodationId}
            style={{
              opacity: selectedAccommodationId ? 1 : 0.5,
              cursor: selectedAccommodationId ? 'pointer' : 'not-allowed'
            }}
            onClick={() => {
              dispatch(setEditingRoom(null)); // Flushes standard draft models clear
              setIsModalOpen(true);
            }}
          >
            + Add Room Profile
          </button>
        </header>

        {/* Scope Selection Workspace Filter Card */}
        <div style={{ marginBottom: "25px", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e8e9e1" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#27382d", marginBottom: "8px" }}>
            SELECT ACCOMMODATION LOCATION PROPERTY:
          </label>
          <select
            value={selectedAccommodationId}
            onChange={(e) => setSelectedAccommodationId(e.target.value)}
            style={{ width: "100%", maxWidth: "420px", padding: "11px 14px", borderRadius: "6px", border: "1px solid #dce2d8", background: "#fff", color: "#27382d", outline: "none", fontSize: "0.95rem" }}
          >
            <option value="">-- Choose active listing to filter rooms --</option>
            {accomodationList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.province})
              </option>
            ))}
          </select>
        </div>

        {/* Error Banner Alert Module */}
        {error && (
          <div style={{ color: "red", padding: "12px", backgroundColor: "#ffe6e6", borderRadius: "5px", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid #f5c6cb" }}>
            <strong>Error Alert:</strong> {error}
          </div>
        )}

        {/* Interactive Inventory Listing Workspace Panel */}
        <section className={styles.notice} style={{ display: "block", background: "white", border: "1px solid #e8e9e1", borderLeft: "4px solid #27382d" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              Fetching room profile records...
            </div>
          ) : !selectedAccommodationId ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              Please pick a target accommodation property listing from the drop-down selector map above to load active inventory arrays.
            </div>
          ) : roomList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#666" }}>
              No rooms registered under this property yet. Click '+ Add Room Profile' to map out dynamic data fields.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e8e9e1" }}>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Media Asset</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Room Details</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price / Night</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status Code</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Specifications</th>
                  <th style={{ padding: "14px 12px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomList.map((room) => (
                  <tr key={room.id} style={{ borderBottom: "1px solid #e8e9e1" }}>
                    {/* Image Gallery Thumbnail Container */}
                    <td style={{ padding: "12px" }}>
                      {room.pictures && room.pictures.length > 0 ? (
                        <img
                          src={`http://localhost:7000/uploads/${room.pictures[0]}`}
                          alt={room.room_type}
                          style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "5px", border: "1px solid #dce2d8" }}
                        />
                      ) : (
                        <div style={{ width: "52px", height: "52px", backgroundColor: "#eaf0e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#666", borderRadius: "5px", fontWeight: 600 }}>
                          No Photo
                        </div>
                      )}
                    </td>

                    {/* Core Details Reference Columns */}
                    <td style={{ padding: "12px" }}>
                      <strong style={{ color: "#27382d", fontSize: "0.98rem" }}>{room.room_type}</strong>
                      <div style={{ fontSize: "11px", color: "#666" }}>Reference ID: #{room.id}</div>
                    </td>

                    {/* Dynamic Base Currency Configurations */}
                    <td style={{ padding: "12px", color: "#27382d", fontWeight: 700, fontSize: "1rem" }}>
                      R {Number(room.price_per_night).toFixed(2)}
                    </td>

                    {/* Operational Status Toggles */}
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "5px 10px",
                        borderRadius: "30px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        backgroundColor: room.is_available ? "#e5eee3" : "#ffe6e6",
                        color: room.is_available ? "#345b40" : "#d9534f",
                        border: room.is_available ? "1px solid #d6e3d3" : "1px solid #f5c6cb"
                      }}>
                        {room.is_available ? "Available" : "Maintenance"}
                      </span>
                    </td>

                    {/* Metadata Text Field Output */}
                    <td style={{ padding: "12px", fontSize: "0.9rem", color: "#555" }}>
                      {room.description || "No specific details provided."}
                    </td>

                    {/* Operation Modification Controls Matrix */}
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(room)}
                          style={{ padding: "6px 10px", fontSize: "0.8rem", cursor: "pointer", background: "#f0f4ef", border: "1px solid #dce2d8", borderRadius: "4px", color: "#27382d" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
      <AddRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} accommodationId={selectedAccommodationId} />
    </div>
  );
};

export default ManageRooms;