import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store";
import { 
    addRoomThunk, 
    updateRoomThunk 
} from "../../redux/features/roomSlice";
import styles from "./AddRoomModal.module.css";

interface AddRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    accommodationId: number | string; // Captured dynamic dropdown filter value passed down from ManageRooms
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, accommodationId }) => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Track if we are editing an existing item from the store slice context
    const { editingRoom, isLoading } = useSelector((state: RootState) => state.room);

    // Local form states
    const [roomType, setRoomType] = useState("");
    const [pricePerNight, setPricePerNight] = useState<number | string>("");
    const [description, setDescription] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);

    // Sync form values when modal opens or shifts between Create and Edit modes
    useEffect(() => {
        if (editingRoom) {
            setRoomType(editingRoom.room_type);
            setPricePerNight(editingRoom.price_per_night);
            setDescription(editingRoom.description);
            setIsAvailable(editingRoom.is_available);
        } else {
            resetLocalFields();
        }
    }, [editingRoom, isOpen]);

    const resetLocalFields = () => {
        setRoomType("");
        setPricePerNight("");
        setDescription("");
        setIsAvailable(true);
        setImageFiles(null);
    };

    const handleClose = () => {
        resetLocalFields();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Package as Multipart FormData to carry image files over the network pipeline
        const formData = new FormData();
        
        // Ensure the correct parent accommodation connection context is bound
        const targetAccId = editingRoom ? editingRoom.accomodation_id : accommodationId;
        formData.append("accommodation_id", String(targetAccId));
        
        formData.append("room_type", roomType);
        formData.append("price_per_night", String(pricePerNight));
        formData.append("description", description);
        formData.append("is_available", String(isAvailable));

        // Append multiple file buffers if uploaded
        if (imageFiles) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append("pictures", imageFiles[i]);
            }
        }

        if (editingRoom) {
            await dispatch(updateRoomThunk({ id: editingRoom.id, formData }));
        } else {
            await dispatch(addRoomThunk(formData));
        }

        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <h2>{editingRoom ? "Modify Room Profile" : "Append New Inventory Room"}</h2>
                    <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    
                    {/* Visual context reminder showing the action is auto-locked to the selected grid asset choice */}
                    {!editingRoom && (
                        <div className={styles.contextAlert}>
                            Adding room configuration under Accommodation Property Ref: <strong>#{accommodationId}</strong>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="roomType">Room Layout Style / Type</label>
                        <input 
                            type="text" 
                            id="roomType" 
                            value={roomType} 
                            onChange={(e) => setRoomType(e.target.value)} 
                            required 
                            placeholder="e.g. Luxury Honeymoon Suite, Twin Standard Room"
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="pricePerNight">Price Per Night (ZAR)</label>
                            <input 
                                type="number" 
                                id="pricePerNight" 
                                min="0" 
                                step="0.01"
                                value={pricePerNight} 
                                onChange={(e) => setPricePerNight(e.target.value)} 
                                required 
                                placeholder="e.g. 1450.00"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="isAvailable">Inventory Status</label>
                            <select 
                                id="isAvailable" 
                                value={String(isAvailable)} 
                                onChange={(e) => setIsAvailable(e.target.value === "true")}
                                required
                            >
                                <option value="true">Available for booking</option>
                                <option value="false">Closed / Maintenence</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Room Description & Specifications</label>
                        <textarea 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required
                            rows={4}
                            placeholder="Detail layout specifications, bed configurations, view orientations, or en-suite parameters..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="pictures">Upload Room Layout Gallery</label>
                        <input 
                            type="file" 
                            id="pictures" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => setImageFiles(e.target.files)} 
                            className={styles.fileInput}
                        />
                        <small className={styles.hintText}>Select multiple interior assets photos at once.</small>
                    </div>

                    <footer className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? "Saving changes..." : editingRoom ? "Update Details" : "Construct Room"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
