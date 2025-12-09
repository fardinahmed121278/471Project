import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ActivityList = ({ type, staffId, childId, filter = 'all' }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActivities();
    }, [type, staffId, childId, filter]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            let url = '';

            if (type === 'staff') {
                url = `http://localhost:5560/api/activities/staff/${staffId}`;
            } else {
                url = `http://localhost:5560/api/activities/child/${childId}`;
                if (filter !== 'all') {
                    url += `?type=${filter}`;
                }
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setActivities(data.activities || []);
            } else {
                setError(data.error || 'Failed to fetch activities');
            }
        } catch (error) {
            setError('Network error. Make sure backend is running.');
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'meal': return '🍽️';
            case 'nap': return '😴';
            case 'activity': return '🎨';
            case 'update': return '📝';
            default: return '📋';
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'meal': return 'type-meal';
            case 'nap': return 'type-nap';
            case 'activity': return 'type-activity';
            case 'update': return 'type-update';
            default: return '';
        }
    };

    const handleDeleteActivity = async (activityId) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        try {
            const response = await fetch(`http://localhost:5560/api/activities/${activityId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                // Refresh the list
                fetchActivities();
                alert('Activity deleted successfully');
            } else {
                alert('Failed to delete activity');
            }
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Error deleting activity');
        }
    };

    if (loading) return <div className="loading">Loading activities...</div>;
    if (error) return <div className="error">{error}</div>;
    if (activities.length === 0) return <div className="loading">No activities found</div>;

    return (
        <div>
        {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
            <div className="activity-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{getTypeIcon(activity.activityType)}</span>
            <span className={`activity-type ${getTypeClass(activity.activityType)}`}>
            {activity.activityType}
            </span>
            <span className="activity-time">
            {format(new Date(activity.date), 'MMM d, h:mm a')}
            </span>
            </div>
            {type === 'staff' && (
                <button
                onClick={() => handleDeleteActivity(activity.id)}
                className="btn btn-danger"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                Delete
                </button>
            )}
            </div>

            <h3 className="activity-title">{activity.title}</h3>
            <p className="activity-description">{activity.description}</p>

            {activity.staffName && (
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
                Posted by: <strong>{activity.staffName}</strong>
                </p>
            )}

            {activity.photos && activity.photos.length > 0 && (
                <div className="photos-container">
                {activity.photos.map((photo, index) => (
                    <img
                    key={index}
                    src={`http://localhost:5560${photo}`}
                    alt={`Activity ${index + 1}`}
                    className="photo-thumbnail"
                    onClick={() => window.open(`http://localhost:5560${photo}`, '_blank')}
                    />
                ))}
                </div>
            )}
            </div>
        ))}
        </div>
    );
};

export default ActivityList;
