import React, { useRef } from 'react';

const PhotoUpload = ({ photos, setPhotos }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setPhotos([...photos, ...files]);
    };

    const handleRemovePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
        <div className="photo-upload-container">
        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        />
        <p>📷 Upload photos of the activity</p>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
        You can upload up to 5 photos (PNG, JPG, JPEG)
        </p>
        <button
        type="button"
        onClick={triggerFileInput}
        className="btn"
        style={{ marginTop: '15px', background: '#e5e7eb' }}
        >
        Choose Photos
        </button>
        </div>

        {photos.length > 0 && (
            <div className="photo-preview">
            {photos.map((photo, index) => (
                <div key={index} className="preview-image">
                <img
                src={URL.createObjectURL(photo)}
                alt={`Preview ${index + 1}`}
                />
                <button
                type="button"
                className="remove-photo"
                onClick={() => handleRemovePhoto(index)}
                >
                ×
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default PhotoUpload;
