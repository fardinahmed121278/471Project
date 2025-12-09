import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5560/api/staff');
      setStaff(res.data.staff);
    } catch (err) {
      console.error(err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5560/api/staff', form);
      setForm({ name: '', email: '', role: '' });
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:5560/api/staff/${id}`);
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h3 style={sectionTitle}>Manage Staff</h3>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={inputStyle} required />
        <select name="role" value={form.role} onChange={handleChange} style={inputStyle} required>
          <option value="">Select Role</option>
          <option value="teacher">Teacher</option>
          <option value="caregiver">Caregiver</option>
          <option value="cook">Cook</option>
        </select>
        <button type="submit" style={btnStyle}>Add Staff</button>
      </form>

      <h4 style={{ marginBottom: '10px' }}>Staff List</h4>
      {loading ? <p>Loading staff...</p> : (
        <table style={tableStyle}>
          <thead style={{ background: '#e0e0e0' }}>
            <tr>
              <th style={thTd}>Name</th>
              <th style={thTd}>Email</th>
              <th style={thTd}>Role</th>
              <th style={thTd}>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan="4" style={thTd}>No staff available</td></tr>
            ) : staff.map(s => (
              <tr key={s.id} style={rowStyle}>
                <td style={thTd}>{s.name}</td>
                <td style={thTd}>{s.email}</td>
                <td style={thTd}>{s.role}</td>
                <td style={thTd}><button onClick={() => handleDelete(s.id)} style={deleteBtn}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Styles
const sectionTitle = { marginBottom: '15px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' };
const btnStyle = { padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thTd = { padding: '10px', textAlign: 'left' };
const rowStyle = { background: '#fff', borderBottom: '1px solid #eee', transition: 'background 0.2s', cursor: 'default' };
const deleteBtn = { padding: '6px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };

// Hover effect
rowStyle[':hover'] = { background: '#f0f0f0' };
