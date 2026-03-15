import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/home/AdminUsers.css";

function AdminUsers() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const canManageUsers = auth?.role === "admin";

  useEffect(() => {
    if (token && canManageUsers) {
      const fetchUsers = async () => {
        try {
          const res = await axios.get("http://localhost:8000/api/auth/users/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data.users);
        } catch (err) {
          console.error("Error fetching users", err);
          setError("Unable to load users");
        }
      };
      fetchUsers();
    }
  }, [token, canManageUsers]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:8000/api/auth/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      console.error("Error deleting user", err);
      setError("Failed to delete user");
    }
  };

  if (!token || !canManageUsers) {
    return <p>You must be logged in as admin to view this page.</p>;
  }

  return (
    <div className="admin-users-page">
      <h2>Registered Users</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul className="user-list">
        {users.map((u) => (
          <li key={u.userId}>
            <span>
              {u.userId} {u.email && `(${u.email})`}
            </span>
            <button onClick={() => handleDelete(u.userId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsers;
