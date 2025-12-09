import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPortal() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    serial: '', name: '', phone: '', role: '', experience: '', joiningDate: ''
  });

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5560/api/staff');
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error(err);
      setStaffList([]);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5560/api/staff', form);
      setForm({ serial: '', name: '', phone: '', role: '', experience: '', joiningDate: '' });
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`http://localhost:5560/api/staff/${id}`); fetchStaff(); }
    catch (err) { console.error(err); }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>👩‍💼 Admin Portal – Manage Staff</h2>

      <div style={formCardStyle}>
        <h3 style={{ marginBottom: '12px' }}>Add New Staff</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input name="serial" placeholder="Serial No." value={form.serial} onChange={handleChange} style={inputStyle} required />
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
          <select name="role" value={form.role} onChange={handleChange} style={inputStyle} required>
            <option value="">Select Role</option>
            <option value="caregiver">Caregiver</option>
            <option value="teacher">Teacher</option>
            <option value="cook">Cook</option>
          </select>
          <input name="experience" placeholder="Experience (years)" value={form.experience} onChange={handleChange} style={inputStyle} />
          <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} style={inputStyle} />
          <button type="submit" style={btnStyle}>Add Staff</button>
        </form>
      </div>

      <div style={tableCardStyle}>
        <h3 style={{ marginBottom: '12px' }}>Staff List</h3>
        <table style={tableStyle}>
          <thead style={{ background: '#e91e63', color: '#fff' }}>
            <tr>
              <th style={thTd}>S/N</th>
              <th style={thTd}>Name</th>
              <th style={thTd}>Phone</th>
              <th style={thTd}>Role</th>
              <th style={thTd}>Experience</th>
              <th style={thTd}>Joining Date</th>
              <th style={thTd}>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr><td colSpan="7" style={thTd}>No staff added</td></tr>
            ) : staffList.map(staff => (
              <tr key={staff.id} style={rowStyle}>
                <td style={thTd}>{staff.serial}</td>
                <td style={thTd}>{staff.name}</td>
                <td style={thTd}>{staff.phone}</td>
                <td style={thTd}>{staff.role}</td>
                <td style={thTd}>{staff.experience}</td>
                <td style={thTd}>{staff.joiningDate}</td>
                <td style={thTd}>
                  <button onClick={() => handleDelete(staff.id)} style={deleteBtnStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------- Styles -----------------
const containerStyle = { padding: '20px', display: 'flex', flexDirection: 'column', gap: '25px', fontFamily: 'Arial, sans-serif', background: '#fff0f5', minHeight: '100vh' };
const titleStyle = { textAlign: 'center', color: '#d81b60', fontWeight: 'bold', fontSize: '2rem' };

const formCardStyle = { padding: '20px', background: '#ffe6f0', borderRadius: '15px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' };
const tableCardStyle = { padding: '20px', background: '#fff', borderRadius: '15px', boxShadow: '0 6px 18px rgba(0,0,0,0.1)' };

const formStyle = { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #d81b60', fontSize: '0.95rem', flex: '1 1 200px' };

const btnStyle = {
  padding: '10px 22px',
  background: 'linear-gradient(45deg,#e91e63,#f06292)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: '0.3s',
};
btnStyle[':hover'] = { transform: 'scale(1.05)' };

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thTd = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #f06292' };
const deleteBtnStyle = { padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' };
const rowStyle = { transition: '0.2s', cursor: 'pointer', hover: { background: '#ffe6f0' } };
