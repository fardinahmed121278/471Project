const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const STAFF_FILE = 'staff.json';
const UPDATES_FILE = 'dailyUpdates.json';

const app = express();
const PORT = 5560;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File Upload Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Data File
const DATA_FILE = 'activities.json';

// Initialize data file if it doesn't exist
if (!fs.existsSync(STAFF_FILE)) fs.writeFileSync(STAFF_FILE, JSON.stringify([]));
if (!fs.existsSync(UPDATES_FILE)) fs.writeFileSync(UPDATES_FILE, JSON.stringify([]));
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper functions

// Staff helpers
const readStaff = () => JSON.parse(fs.readFileSync(STAFF_FILE, 'utf8'));
const writeStaff = (staff) => fs.writeFileSync(STAFF_FILE, JSON.stringify(staff, null, 2));

// Daily updates helpers
const readUpdates = () => JSON.parse(fs.readFileSync(UPDATES_FILE, 'utf8'));
const writeUpdates = (updates) => fs.writeFileSync(UPDATES_FILE, JSON.stringify(updates, null, 2));
// Activities helpers
const readActivities = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

const writeActivities = (activities) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(activities, null, 2));
};

// API 1: Create new activity (Staff)
app.post('/api/activities', (req, res) => {
    try {
        const activity = {
            id: Date.now().toString(),
         ...req.body,
         date: new Date().toISOString(),
         photos: []
        };

        const activities = readActivities();
        activities.push(activity);
        writeActivities(activities);

        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            activity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 2: Upload photos for activity
app.post('/api/activities/:id/photos', upload.array('photos', 5), (req, res) => {
    try {
        const activityId = req.params.id;
        const activities = readActivities();
        const activity = activities.find(a => a.id === activityId);

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Save photo URLs
        const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
        activity.photos = [...activity.photos, ...photoUrls];

        writeActivities(activities);

        res.json({
            success: true,
            message: 'Photos uploaded successfully',
            photos: photoUrls
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 3: Get all activities for a child (Parent)
app.get('/api/activities/child/:childId', (req, res) => {
    try {
        const { childId } = req.params;
        const { type, date } = req.query;

        let activities = readActivities();
        activities = activities.filter(a => a.childId === childId);

        // Filter by type if provided
        if (type && type !== 'all') {
            activities = activities.filter(a => a.activityType === type);
        }

        // Filter by date if provided
        if (date) {
            activities = activities.filter(a =>
            a.date.split('T')[0] === date
            );
        }

        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            count: activities.length,
            activities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 4: Get today's summary (Parent)
app.get('/api/activities/summary/:childId', (req, res) => {
    try {
        const { childId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const activities = readActivities();
        const todayActivities = activities.filter(a =>
        a.childId === childId && a.date.includes(today)
        );

        // Categorize
        const summary = {
            meals: todayActivities.filter(a => a.activityType === 'meal'),
        naps: todayActivities.filter(a => a.activityType === 'nap'),
        activities: todayActivities.filter(a => a.activityType === 'activity'),
        updates: todayActivities.filter(a => a.activityType === 'update'),
        total: todayActivities.length,
        photos: todayActivities.filter(a => a.photos.length > 0).length
        };

        res.json({
            success: true,
            date: today,
            summary
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 5: Get all activities (Staff view)
app.get('/api/activities/staff/:staffId', (req, res) => {
    try {
        const { staffId } = req.params;
        const activities = readActivities()
        .filter(a => a.staffId === staffId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            count: activities.length,
            activities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 6: Delete activity
app.delete('/api/activities/:id', (req, res) => {
    try {
        const { id } = req.params;
        let activities = readActivities();

        const initialLength = activities.length;
        activities = activities.filter(a => a.id !== id);

        if (activities.length === initialLength) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        writeActivities(activities);

        res.json({
            success: true,
            message: 'Activity deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create staff
app.post('/api/staff', (req, res) => {
    try {
        const { serial, name, phone, role, experience, joiningDate } = req.body;
        if (!serial || !name || !phone || !role) {
            return res.status(400).json({ error: 'Serial, name, phone, and role are required' });
        }

        const staff = readStaff();
        const id = Date.now().toString();
        const newStaff = { id, serial, name, phone, role, experience, joiningDate };
        staff.push(newStaff);
        writeStaff(staff);

        res.status(201).json({ success: true, staff: newStaff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all staff
app.get('/api/staff', (req, res) => {
    try {
        const staff = readStaff();
        res.json({ success: true, staff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update staff
app.put('/api/staff/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const staff = readStaff();
        const member = staff.find(s => s.id === id);
        if (!member) return res.status(404).json({ error: 'Staff not found' });

        if (name) member.name = name;
        if (email) member.email = email;
        if (role) member.role = role;

        writeStaff(staff);
        res.json({ success: true, staff: member });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete staff
app.delete('/api/staff/:id', (req, res) => {
    try {
        let staff = readStaff();
        const lengthBefore = staff.length;
        staff = staff.filter(s => s.id !== req.params.id);
        if (staff.length === lengthBefore) return res.status(404).json({ error: 'Staff not found' });

        writeStaff(staff);
        res.json({ success: true, message: 'Staff deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Test API
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        endpoints: [
            'POST /api/activities - Create activity',
            'POST /api/activities/:id/photos - Upload photos',
            'GET /api/activities/child/:childId - Get child activities',
            'GET /api/activities/summary/:childId - Get daily summary',
            'GET /api/activities/staff/:staffId - Get staff activities',
            'DELETE /api/activities/:id - Delete activity'
        ]
    });
});

// Create daily update
app.post('/api/updates', (req, res) => {
    try {
        const { childId, staffId, attendance, nap, meals, behavior } = req.body;
        if (!childId || !staffId) return res.status(400).json({ error: 'Child ID and Staff ID required' });

        const updates = readUpdates();
        const id = Date.now().toString();
        const date = new Date().toISOString().split('T')[0];
        const newUpdate = { id, childId, staffId, date, attendance, nap, meals, behavior };
        updates.push(newUpdate);
        writeUpdates(updates);

        res.status(201).json({ success: true, update: newUpdate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get updates for a child
app.get('/api/updates/:childId', (req, res) => {
    try {
        const updates = readUpdates().filter(u => u.childId === req.params.childId);
        res.json({ success: true, count: updates.length, updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit an update
app.put('/api/updates/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updates = readUpdates();
        const update = updates.find(u => u.id === id);
        if (!update) return res.status(404).json({ error: 'Update not found' });

        const { attendance, nap, meals, behavior } = req.body;
        if (attendance) update.attendance = attendance;
        if (nap) update.nap = nap;
        if (meals) update.meals = meals;
        if (behavior) update.behavior = behavior;

        writeUpdates(updates);
        res.json({ success: true, update });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an update
app.delete('/api/updates/:id', (req, res) => {
    try {
        let updates = readUpdates();
        const lengthBefore = updates.length;
        updates = updates.filter(u => u.id !== req.params.id);
        if (updates.length === lengthBefore) return res.status(404).json({ error: 'Update not found' });

        writeUpdates(updates);
        res.json({ success: true, message: 'Update deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: http://localhost:${PORT}/uploads`);
    console.log(`🔧 Test API: http://localhost:${PORT}/api/test`);
});
