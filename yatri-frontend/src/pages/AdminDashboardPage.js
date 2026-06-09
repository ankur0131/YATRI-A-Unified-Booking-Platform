import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";

const TYPE_OPTIONS = ["bus", "train", "cab"];

const initialForms = {
  bus: {
    name: "",
    operator: "",
    type: "AC Seater",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    price: "",
    totalSeats: "",
    availableSeats: "",
    rating: "4",
    amenities: "",
  },
  train: {
    name: "",
    number: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    classesText: "Sleeper:800:50",
    rating: "4",
    amenities: "",
  },
  cab: {
    type: "Sedan",
    from: "",
    to: "",
    pricePerKm: "",
    estimatedDistance: "",
    estimatedPrice: "",
    estimatedDuration: "",
    driverRating: "4",
    tripType: "One-way",
    features: "",
    available: true,
  },
};

function AdminDashboardPage({ theme, onToggleTheme, pushToast }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [transportType, setTransportType] = useState("bus");
  const [bookings, setBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState(initialForms);
  const [editingId, setEditingId] = useState("");
  const isLight = theme === "light";
  const token = useMemo(() => localStorage.getItem("token"), []);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const loadBookings = useCallback(async () => {
    const response = await fetch("http://localhost:5000/api/admin/bookings", { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load bookings");
    setBookings(data.bookings || []);
  }, [authHeaders]);

  const loadTransports = useCallback(async () => {
    const response = await fetch(`http://localhost:5000/api/admin/transports?type=${transportType}`, { headers: authHeaders });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load transports");
    setItems(data.items || []);
  }, [authHeaders, transportType]);

  useEffect(() => {
    const run = async () => {
      try {
        if (activeTab === "bookings") {
          await loadBookings();
        } else {
          await loadTransports();
        }
      } catch (error) {
        pushToast({ type: "error", title: "Admin error", message: error.message });
      }
    };
    run();
  }, [activeTab, loadBookings, loadTransports, pushToast]);

  const buildPayload = () => {
    const form = forms[transportType];
    if (transportType === "bus") {
      return {
        ...form,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        availableSeats: Number(form.availableSeats),
        rating: Number(form.rating || 4),
        amenities: form.amenities ? form.amenities.split(",").map((x) => x.trim()).filter(Boolean) : [],
      };
    }
    if (transportType === "train") {
      return {
        name: form.name,
        number: form.number,
        from: form.from,
        to: form.to,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        duration: form.duration,
        rating: Number(form.rating || 4),
        amenities: form.amenities ? form.amenities.split(",").map((x) => x.trim()).filter(Boolean) : [],
        classes: form.classesText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((line) => {
            const [type, price, availableSeats] = line.split(":");
            return { type, price: Number(price), availableSeats: Number(availableSeats) };
          }),
      };
    }
    return {
      ...form,
      pricePerKm: Number(form.pricePerKm),
      estimatedDistance: Number(form.estimatedDistance),
      estimatedPrice: Number(form.estimatedPrice),
      driverRating: Number(form.driverRating || 4),
      features: form.features ? form.features.split(",").map((x) => x.trim()).filter(Boolean) : [],
      available: Boolean(form.available),
    };
  };

  const onSave = async () => {
    try {
      const payload = buildPayload();
      const url = editingId
        ? `http://localhost:5000/api/admin/transports/${transportType}/${editingId}`
        : `http://localhost:5000/api/admin/transports/${transportType}`;
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save");
      pushToast({ type: "success", title: "Saved", message: editingId ? "Route updated" : "Route created" });
      setEditingId("");
      setForms((current) => ({ ...current, [transportType]: initialForms[transportType] }));
      await loadTransports();
    } catch (error) {
      pushToast({ type: "error", title: "Save failed", message: error.message });
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/transports/${transportType}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      pushToast({ type: "success", title: "Deleted", message: "Record removed" });
      await loadTransports();
    } catch (error) {
      pushToast({ type: "error", title: "Delete failed", message: error.message });
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    if (transportType === "bus") {
      setForms((c) => ({
        ...c,
        bus: {
          name: item.name || "",
          operator: item.operator || "",
          type: item.type || "AC Seater",
          from: item.from || "",
          to: item.to || "",
          departureTime: item.departureTime || "",
          arrivalTime: item.arrivalTime || "",
          duration: item.duration || "",
          price: String(item.price || ""),
          totalSeats: String(item.totalSeats || ""),
          availableSeats: String(item.availableSeats || ""),
          rating: String(item.rating || "4"),
          amenities: (item.amenities || []).join(", "),
        },
      }));
    } else if (transportType === "train") {
      setForms((c) => ({
        ...c,
        train: {
          name: item.name || "",
          number: item.number || "",
          from: item.from || "",
          to: item.to || "",
          departureTime: item.departureTime || "",
          arrivalTime: item.arrivalTime || "",
          duration: item.duration || "",
          classesText: (item.classes || []).map((cls) => `${cls.type}:${cls.price}:${cls.availableSeats}`).join(", "),
          rating: String(item.rating || "4"),
          amenities: (item.amenities || []).join(", "),
        },
      }));
    } else {
      setForms((c) => ({
        ...c,
        cab: {
          type: item.type || "Sedan",
          from: item.from || "",
          to: item.to || "",
          pricePerKm: String(item.pricePerKm || ""),
          estimatedDistance: String(item.estimatedDistance || ""),
          estimatedPrice: String(item.estimatedPrice || ""),
          estimatedDuration: item.estimatedDuration || "",
          driverRating: String(item.driverRating || "4"),
          tripType: item.tripType || "One-way",
          features: (item.features || []).join(", "),
          available: Boolean(item.available),
        },
      }));
    }
  };

  const fields = Object.keys(forms[transportType]);

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      <div className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/80" : "border-white/10 bg-white/5"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className={`font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Admin Dashboard</h1>
          <button
            onClick={logout}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          {["bookings", "transports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === tab ? "saffron-gradient text-neutral-950" : "border border-neutral-300"}`}
            >
              {tab === "bookings" ? "User Bookings" : "Manage Routes"}
            </button>
          ))}
        </div>

        {activeTab === "bookings" ? (
          <div className="mt-6 space-y-3">
            {bookings.map((booking) => (
              <div key={booking._id} className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/10" : "border-white/10"}`}>
                <p className={`font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>{booking.transportName} ({booking.type})</p>
                <p className={`text-sm ${isLight ? "text-neutral-600" : "text-white/70"}`}>{booking.source} to {booking.destination} | {booking.date}</p>
                <p className={`text-sm ${isLight ? "text-neutral-600" : "text-white/70"}`}>{booking.userName} ({booking.userEmail}) | Status: {booking.status}</p>
              </div>
            ))}
            {!bookings.length ? <p className={isLight ? "text-neutral-600" : "text-white/70"}>No bookings found.</p> : null}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/10" : "border-white/10"}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className={`font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Add / Update Transport</h2>
                <select
                  value={transportType}
                  onChange={(e) => {
                    setTransportType(e.target.value);
                    setEditingId("");
                  }}
                  className="rounded-xl border px-3 py-2 text-sm text-neutral-900"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3">
                {fields.map((field) => (
                  <label key={field} className="block">
                    <span className={`mb-1 block text-xs ${isLight ? "text-neutral-500" : "text-white/60"}`}>{field}</span>
                    {field === "available" ? (
                      <select
                        value={forms[transportType][field] ? "true" : "false"}
                        onChange={(e) =>
                          setForms((current) => ({
                            ...current,
                            [transportType]: { ...current[transportType], [field]: e.target.value === "true" },
                          }))
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm text-neutral-900"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input
                        value={forms[transportType][field]}
                        onChange={(e) =>
                          setForms((current) => ({
                            ...current,
                            [transportType]: { ...current[transportType], [field]: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm text-neutral-900"
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={onSave} className="rounded-xl saffron-gradient px-4 py-2 text-sm font-semibold text-neutral-950">
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId ? (
                  <button
                    onClick={() => {
                      setEditingId("");
                      setForms((current) => ({ ...current, [transportType]: initialForms[transportType] }));
                    }}
                    className="rounded-xl border px-4 py-2 text-sm"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/10" : "border-white/10"}`}>
              <h2 className={`font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Existing {transportType}s</h2>
              <div className="mt-3 space-y-3 max-h-[520px] overflow-auto">
                {items.map((item) => (
                  <div key={item._id} className={`rounded-xl border p-3 ${isLight ? "border-neutral-900/10" : "border-white/10"}`}>
                    <p className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {item.name || item.type} - {item.from} to {item.to}
                    </p>
                    <p className={`text-xs ${isLight ? "text-neutral-600" : "text-white/70"}`}>
                      {item.departureTime || "Flexible"} to {item.arrivalTime || "Flexible"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => startEdit(item)} className="rounded-lg border px-3 py-1 text-xs">Edit timing/details</button>
                      <button onClick={() => onDelete(item._id)} className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-600">Delete</button>
                    </div>
                  </div>
                ))}
                {!items.length ? <p className={isLight ? "text-neutral-600" : "text-white/70"}>No records.</p> : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default AdminDashboardPage;
