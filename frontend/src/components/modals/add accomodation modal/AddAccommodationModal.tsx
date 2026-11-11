import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import React from 'react';
import {
    updateAccomodationFormField,
    addAccomodationThunk,
    updateAccomodationThunk,
    resetAccomodationForm,
    getAccomodationsThunk
} from '../../../redux/features/accomodationSlice';
import styles from './AddAccommodationModal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddAccommodationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { form, editingAccomodation, isLoading, error } = useAppSelector((state) => state.accomodation);
    
    const [localPictures, setLocalPictures] = React.useState<File[]>([]);

    const isEditMode = Boolean(editingAccomodation);

    if (!isOpen) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        dispatch(updateAccomodationFormField({ field: name as any, value }));
    };

    const handleClose = () => {
        setLocalPictures([]);
        dispatch(resetAccomodationForm());
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in as an administrator.");
            return;
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('address', form.address);
        formData.append('star_rating', form.star_rating.toString());
        formData.append('province', form.province);
        
        const amenitiesArray = typeof form.amenities === 'string' 
            ? (form.amenities as string).split(',').map(item => item.trim()) 
            : form.amenities;

        const roomsArray = typeof form.rooms === 'string' 
            ? (form.rooms as string).split(',').map(item => item.trim()) 
            : form.rooms;

        formData.append('amenities', JSON.stringify(amenitiesArray));
        formData.append('rooms', JSON.stringify(roomsArray));

        if (localPictures.length > 0) {
            localPictures.forEach((file: File) => {
                formData.append('pictures', file); 
            });
        }

        let result;
        if (isEditMode && editingAccomodation) {
            // Dispatch update thunk
            result = await dispatch(updateAccomodationThunk({
                id: editingAccomodation.id,
                formData
            }));
        } else {
            // Dispatch create thunk
            result = await dispatch(addAccomodationThunk(formData));
        }

        if (
            (isEditMode && updateAccomodationThunk.fulfilled.match(result)) ||
            (!isEditMode && addAccomodationThunk.fulfilled.match(result))
        ) {
            dispatch(getAccomodationsThunk());
            handleClose();
            alert(isEditMode ? "Accommodation updated successfully!" : "Accommodation added successfully!");
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <header className={styles.modalHeader}>
                    <h2>{isEditMode ? "Edit Accommodation Profile" : "Add New WildHeaven Accommodation"}</h2>
                    <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
                </header>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.inputGroup}>
                        <label>Accommodation Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Imperial Hotel"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            required
                            placeholder="Describe hotel facilities, views, and elegant aesthetics..."
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Physical Address</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            required
                            placeholder="123 Phoswa street"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Star Rating</label>
                            <select name="star_rating" value={form.star_rating} onChange={handleInputChange}>
                                <option value={1.0}>1.0 Star</option>
                                <option value={1.5}>1.5 Stars</option>
                                <option value={2.0}>2.0 Stars</option>
                                <option value={2.5}>2.5 Stars</option>
                                <option value={3.0}>3.0 Stars</option>
                                <option value={3.5}>3.5 Stars</option>
                                <option value={4.0}>4.0 Stars</option>
                                <option value={4.5}>4.5 Stars</option>
                                <option value={5.0}>5.0 Stars</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Province</label>
                            <select name="province" value={form.province} onChange={handleInputChange} required>
                                <option value="">Select Province</option>
                                <option value="Gauteng">Gauteng</option>
                                <option value="Western Cape">Western Cape</option>
                                <option value="Eastern Cape">Eastern Cape</option>
                                <option value="Northern Cape">Northern Cape</option>
                                <option value="Limpopo">Limpopo</option>
                                <option value="Mpumalanga">Mpumalanga</option>
                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                <option value="Free State">Free State</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Amenities (Comma Separated)</label>
                        <input
                            type="text"
                            name="amenities"
                            value={Array.isArray(form.amenities) ? form.amenities.join(', ') : form.amenities}  
                            onChange={handleInputChange}
                            placeholder="wifi, pool, spa, gym"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Rooms (Comma Separated)</label>
                        <input
                            type="text"
                            name="rooms"
                            value={Array.isArray(form.rooms) ? form.rooms.join(', ') : form.rooms}
                            onChange={handleInputChange}
                            placeholder="Standard, Deluxe, Suite"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Photo Gallery {isEditMode && "(Existing images will be kept)"}</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            name="pictures"
                            onChange={(e) => {
                                if (e.target.files) {
                                    const newFiles = Array.from(e.target.files);
                                    setLocalPictures((prev) => [...prev, ...newFiles]);
                                }
                            }}
                        />

                        {localPictures.length > 0 && (
                            <div className={styles.previewGrid}>
                                {localPictures.map((file, index) => (
                                    <div key={index} className={styles.previewItem}>
                                        <img 
                                            src={URL.createObjectURL(file)} 
                                            alt={`preview ${index}`} 
                                            className={styles.previewImage}
                                        />
                                        <button
                                            type="button"
                                            className={styles.removeImgBtn}
                                            onClick={() => setLocalPictures(prev => prev.filter((_, i) => i !== index))}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Accommodation' : 'Add Accommodation')}
                    </button>
                </form>
            </div>
        </div>
    );
};