// src/components/homecomponents/Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import "../../styles/home/Dashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  // start with null so we can tell whether fetch happened
  const [counts, setCounts] = useState({ users: null, admins: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  const role = auth?.role;
  const token = auth?.token;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/stats/`);
        setCounts({
          users: res.data.users,
          admins: res.data.admins,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard counts", err);
        setError("Unable to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // if admin, also fetch users list
    if (role === "admin") {
      const fetchUsers = async () => {
        try {
          const resp = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/users/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsersList(resp.data.users);
        } catch (e) {
          console.error("Could not load user list", e);
        }
      };
      fetchUsers();
    }
  }, [role, token]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/auth/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList((prev) => prev.filter((u) => u.userId !== userId));
    } catch (e) {
      console.error("failed to delete", e);
    }
  };

  return (
    <section className="dashboard">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="card">
        <h3>Users</h3>
        <p id="userCount">{loading ? "..." : counts.users !== null ? counts.users : "0"}</p>
      </div>
      <div className="card">
        <h3>Admins</h3>
        <p id="adminCount">{loading ? "..." : counts.admins !== null ? counts.admins : "0"}</p>
      </div>

      {role === "admin" && (
        <>
          <div className="admin-section">
            <h4 className="admin-actions-title">Admin Actions</h4>
            <div className="admin-actions-grid">
              <button type="button" className="admin-action-card" onClick={() => navigate("/admin/crops")}>
                <span className="admin-action-label">Manage Crops</span>
              </button>

              <button type="button" className="admin-action-card" onClick={() => navigate("/admin/soils")}>
                <span className="admin-action-label">Manage Soils</span>
              </button>

              <button type="button" className="admin-action-card" onClick={() => navigate("/admin/users")}>
                <span className="admin-action-label">Manage Users</span>
              </button>

            </div>
          </div>


        </>
      )}
    </section>
  );
};

export default Dashboard;
