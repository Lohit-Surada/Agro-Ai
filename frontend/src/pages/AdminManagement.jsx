import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminUsers.css";

const AdminManagement = () => {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/auth/admins/`, { headers });
      setAdmins(response.data?.admins || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load admins");
    }
  };

  useEffect(() => {
    if (token && (auth?.role === "admin" || auth?.role === "superadmin")) fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, auth?.role]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8000/api/auth/admins/create/`, formData, { headers });
      setAdmins((prev) => [...prev, response.data.admin]);
      setFormData({ name: "", email: "", password: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create admin");
    }
  };

  const handleDelete = async (username) => {
    try {
      await axios.delete(`http://localhost:8000/api/auth/admins/${username}/`, { headers });
      setAdmins((prev) => prev.filter((admin) => admin.username !== username));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete admin");
    }
  };

  if (!token || (auth?.role !== "admin" && auth?.role !== "superadmin")) {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-users-page">
      <h2>Manage Admins</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleCreate} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Admin Name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="email"
          placeholder="Admin Email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          required
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Add Admin</button>
      </form>

      <ul className="user-list">
        {admins.map((admin) => (
          <li key={admin.username}>
            <span>
              {admin.name} ({admin.username}) {admin.email ? `- ${admin.email}` : ""}
            </span>
            <button onClick={() => handleDelete(admin.username)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminManagement;
