import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });
  const token = localStorage.getItem("token");

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setStatus({ type: "error", text: "Please login first" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "Failed to load bookings" });
        return;
      }

      setBookings(Array.isArray(data) ? data : []);
      setStatus({ type: "", text: "" });
    } catch (error) {
      setStatus({ type: "error", text: "Backend server not reachable" });
    }
  }, [token]);

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "Cancel failed" });
        return;
      }

      setStatus({ type: "success", text: "Booking cancelled" });
      fetchBookings();
    } catch (error) {
      setStatus({ type: "error", text: "Backend server not reachable" });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="page-wrap mybookings-page">
      <div className="shell">
        <div className="card">
          <div className="top-nav">
            <div className="nav-links">
              <Link className="pill" to="/booking">New Booking</Link>
              <Link className="pill" to="/">Home</Link>
            </div>
          </div>

          <div className="hero">
            <div>
              <div className="brand">
                <span className="brand-badge" />
                <strong>YATRI</strong>
              </div>
              <h1 className="title">My Bookings</h1>
              <p className="subtitle">Premium timeline of your trips and quick cancellation.</p>
            </div>
          </div>

        {status.text ? (
          <p className={`status ${status.type}`}>{status.text}</p>
        ) : null}

        {bookings.length === 0 ? (
          <p className="subtitle">No bookings found.</p>
        ) : (
          <ul className="booking-list">
            {bookings.map((item) => (
              <li key={item._id} className="booking-item">
                <strong>{item.type?.toUpperCase()}</strong> | {item.source} to {item.destination}
                <br />
                Date: {item.date} | Price: Rs. {item.price}
                <br />
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button className="btn danger" type="button" onClick={() => cancelBooking(item._id)} style={{ width: "auto" }}>
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;
