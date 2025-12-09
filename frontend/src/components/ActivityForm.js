import React, { useState } from 'react';
import PhotoUpload from './PhotoUpload';

const ActivityForm = ({ staffId, childId, onActivityCreated }) => {
    const [formData, setFormData] = useState({
        activityType: 'update',
        title: '',
        description: '',
        childId: childId,
        staffId: staffId,
        childName: 'Liam Ahmed',
        staffName: 'Ms. Anita'
    });

    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create activity
            const activityResponse = await fetch('http://localhost:5560/api/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    id: Date.now().toString()
                })
            });

            const activityData = await activityResponse.json();

            if (!activityData.success) {
                throw new Error(activityData.error || 'Failed to create activity');
            }

            // Upload photos if any
            if (photos.length > 0) {
                const formDataPhotos = new FormData();
                photos.forEach(photo => {
                    formDataPhotos.append('photos', photo);
                });

                const uploadResponse = await fetch(
                    `http://localhost:5560/api/activities/${activityData.activity.id}/photos`,
                    {
                        method: 'POST',
                        body: formDataPhotos
                    }
                );

                const uploadData = await uploadResponse.json();
                if (!uploadData.success) {
                    console.warn('Photos upload failed:', uploadData.error);
                }
            }

            // Reset form
            setFormData({
                activityType: 'update',
                title: '',
                description: '',
                childId: childId,
                staffId: staffId,
                childName: 'Liam Ahmed',
                staffName: 'Ms. Anita'
            });
            setPhotos([]);

            // Notify parent component
            onActivityCreated();

            alert('✅ Activity posted successfully!');

        } catch (error) {
            setError(error.message);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
        <label>Activity Type</label>
        <select
        name="activityType"
        value={formData.activityType}
        onChange={handleChange}
        className="form-control"
        required
        >
        <option value="update">📝 General Update</option>
        <option value="meal">🍽️ Meal</option>
        <option value="nap">😴 Nap</option>
        <option value="activity">🎨 Activity</option>
        </select>
        </div>

        <div className="form-group">
        <label>Title</label>
        <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="form-control"
        placeholder="E.g., 'Fun Painting Session' or 'Lunch Time'"
        required
        />
        </div>

        <div className="form-group">
        <label>Description</label>
        <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="form-control textarea"
        placeholder="Describe what happened..."
        rows="4"
        required
        />
        </div>

        <div className="form-group">
        <label>Add Photos (Optional)</label>
        <PhotoUpload photos={photos} setPhotos={setPhotos} />
        </div>

        <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        >
        {loading ? 'Posting Activity...' : '📤 Publish Activity'}
        </button>
        </form>
    );
};

export default ActivityForm;
