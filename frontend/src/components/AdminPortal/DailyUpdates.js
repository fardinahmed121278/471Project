import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DailyUpdates() {
  const [form, setForm] = useState({ childId: '', staffId: '', attendance: '', nap: '', meals: '', behavior: '' });
  const [updates, setUpdates] = useState([]);

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`http://localhost:5560/api/updates/${form.childId || 'CHILD001'}`);
      setUpdates(res.data.updates || []);
    } catch (err) { setUpdates([]); }
  };

  useEffect(() => { fetchUpdates(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5560/api/updates', form);
      setForm({ childId: '', staffId: '', attendance: '', nap: '', meals: '', behavior: '' });
      fetchUpdates();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h3 style={sectionTitle}>Record Daily Update</h3>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="childId" placeholder="Child ID" value={form.childId} onChange={handleChange} style={inputStyle} required />
        <input name="staffId" placeholder="Staff ID" value={form.staffId} onChange={handleChange} style={inputStyle} required />
        <input name="attendance" placeholder="Attendance" value={form.attendance} onChange={handleChange} style={inputStyle} />
        <input name="nap" placeholder="Nap Time" value={form.nap} onChange={handleChange} style={inputStyle} />
        <input name="meals" placeholder="Meals" value={form.meals} onChange={handleChange} style={inputStyle} />
        <input name="behavior" placeholder="Behavior Notes" value={form.behavior} onChange={handleChange} style={inputStyle} />
        <button type="submit" style={btnStyle}>Submit Update</button>
      </form>

      <h4 style={{ marginBottom: '10px' }}>Recent Updates</h4>
      <table style={tableStyle}>
        <thead style={{ background: '#e0e0e0' }}>
          <tr>
            <th style={thTd}>Child ID</th>
            <th style={thTd}>Staff ID</th>
            <th style={thTd}>Attendance</th>
            <th style={thTd}>Nap</th>
            <th style={thTd}>Meals</th>
            <th style={thTd}>Behavior</th>
          </tr>
        </thead>
        <tbody>
          {updates.length === 0 ? (
            <tr><td colSpan="6" style={thTd}>No updates recorded</td></tr>
          ) : updates.map(u => (
            <tr key={u.id} style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
              <td style={thTd}>{u.childId}</td>
              <td style={thTd}>{u.staffId}</td>
              <td style={thTd}>{u.attendance}</td>
              <td style={thTd}>{u.nap}</td>
              <td style={thTd}>{u.meals}</td>
              <td style={thTd}>{u.behavior}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Reuse styles
const sectionTitle = { marginBottom: '15px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' };
const btnStyle = { padding: '10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thTd = { padding: '10px', textAlign: 'left' };
