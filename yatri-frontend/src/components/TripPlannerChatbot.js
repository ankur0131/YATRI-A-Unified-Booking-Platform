import { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const PREFERENCES = [
  { id: "cheapest", label: "Cheapest option" },
  { id: "comfort", label: "Better AC comfort" },
  { id: "luxury", label: "High-class trip" },
];

function parseBus(bus) {
  return {
    mode: "bus",
    id: bus._id,
    name: bus.name,
    provider: bus.operator,
    price: Number(bus.price || 0),
    acScore: String(bus.type || "").toLowerCase().includes("ac") ? 2 : 0,
    luxuryScore: Number(bus.rating || 0) + (String(bus.type || "").toLowerCase().includes("sleeper") ? 1 : 0),
    details: `${bus.from} to ${bus.to} | ${bus.departureTime} - ${bus.arrivalTime}`,
  };
}

function parseTrain(train) {
  const classes = Array.isArray(train.classes) ? train.classes : [];
  const sortedClasses = [...classes].sort((a, b) => (a.price || 0) - (b.price || 0));
  const cheapestClass = sortedClasses[0];
  const priciestClass = sortedClasses[sortedClasses.length - 1];
  return {
    mode: "train",
    id: train._id,
    name: train.name,
    provider: `Train ${train.number || ""}`.trim(),
    price: Number(cheapestClass?.price || 0),
    premiumPrice: Number(priciestClass?.price || cheapestClass?.price || 0),
    acScore: classes.some((item) => ["1A", "2A", "3A", "CC"].includes(item.type)) ? 3 : 1,
    luxuryScore: Number(train.rating || 0) + (classes.some((item) => item.type === "1A") ? 2 : 1),
    details: `${train.from} to ${train.to} | ${train.departureTime} - ${train.arrivalTime}`,
  };
}

function parseCab(cab) {
  return {
    mode: "cab",
    id: cab._id,
    name: cab.type,
    provider: "Yatri Cabs",
    price: Number(cab.estimatedPrice || 0),
    acScore: 3,
    luxuryScore: Number(cab.driverRating || 0) + (String(cab.type || "").toLowerCase().includes("luxury") ? 3 : 1),
    details: `${cab.from} to ${cab.to} | ${cab.estimatedDuration}`,
  };
}

function pickRecommendation(options, preference) {
  if (!options.length) return null;
  if (preference === "cheapest") {
    return [...options].sort((a, b) => a.price - b.price)[0];
  }
  if (preference === "comfort") {
    return [...options].sort((a, b) => (b.acScore - a.acScore) || (a.price - b.price))[0];
  }
  return [...options].sort((a, b) => (b.luxuryScore - a.luxuryScore) || (b.price - a.price))[0];
}

function TripPlannerChatbot({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [preference, setPreference] = useState("cheapest");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const isLight = theme === "light";

  const canSearch = useMemo(() => from.trim() && to.trim() && date, [from, to, date]);

  const handlePlanTrip = async () => {
    if (!canSearch) return;
    setLoading(true);
    setResult(null);
    try {
      const query = `from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}&date=${encodeURIComponent(date)}`;
      const [busRes, trainRes, cabRes] = await Promise.all([
        fetch(`http://localhost:5000/api/transports/buses/search?${query}`),
        fetch(`http://localhost:5000/api/transports/trains/search?${query}`),
        fetch(`http://localhost:5000/api/transports/cabs/search?${query}`),
      ]);

      const [busData, trainData, cabData] = await Promise.all([busRes.json(), trainRes.json(), cabRes.json()]);
      const options = [
        ...(Array.isArray(busData.buses) ? busData.buses.map(parseBus) : []),
        ...(Array.isArray(trainData.trains) ? trainData.trains.map(parseTrain) : []),
        ...(Array.isArray(cabData.cabs) ? cabData.cabs.map(parseCab) : []),
      ].filter((item) => Number.isFinite(item.price) && item.price > 0);

      const recommendation = pickRecommendation(options, preference);
      if (!recommendation) {
        setResult({
          summary: "No route data found for this combination yet.",
          alternatives: [],
          modeComparison: [],
        });
        return;
      }

      const alternatives = [...options]
        .sort((a, b) => a.price - b.price)
        .slice(0, 3)
        .map((item) => `${item.mode.toUpperCase()}: ${item.name} - Rs. ${item.price}`);

      const cheapestByMode = ["bus", "train", "cab"].reduce((acc, mode) => {
        const modeOptions = options.filter((item) => item.mode === mode).sort((a, b) => a.price - b.price);
        acc[mode] = modeOptions[0] || null;
        return acc;
      }, {});

      const busPrice = cheapestByMode.bus?.price || null;
      const modeComparison = ["train", "cab"].map((mode) => {
        const option = cheapestByMode[mode];
        if (!option || !busPrice) {
          return `${mode.toUpperCase()}: no direct comparison with bus available`;
        }
        const delta = option.price - busPrice;
        if (delta === 0) {
          return `${mode.toUpperCase()}: same price as bus (Rs. ${option.price})`;
        }
        if (delta > 0) {
          return `${mode.toUpperCase()}: Rs. ${delta} higher than bus`;
        }
        return `${mode.toUpperCase()}: Rs. ${Math.abs(delta)} lower than bus`;
      });

      let reason = "Balanced option.";
      if (preference === "cheapest") reason = "This has the lowest fare for your route.";
      if (preference === "comfort") reason = "This is better for AC comfort while still being value-friendly.";
      if (preference === "luxury") reason = "This gives a premium/high-class travel experience.";

      setResult({
        summary: `${recommendation.mode.toUpperCase()} recommended: ${recommendation.name} (${recommendation.provider}) - Rs. ${recommendation.price}. ${reason}`,
        details: recommendation.details,
        alternatives,
        modeComparison,
      });
    } catch (error) {
      setResult({
        summary: "Could not compare options right now. Please try again.",
        alternatives: [],
        modeComparison: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full saffron-gradient text-neutral-950 shadow-[0_16px_40px_rgba(255,153,51,0.35)]"
        aria-label="Open trip planner chatbot"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {isOpen ? (
        <div className={`fixed bottom-24 right-6 z-50 w-[92vw] max-w-md rounded-[24px] border p-4 ${isLight ? "border-neutral-900/10 bg-white" : "border-white/10 bg-[#0f0f12] text-white"}`}>
          <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>Trip Planner Bot</p>
          <h3 className={`mt-2 font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Plan my route</h3>
          <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/65"}`}>
            Compare bus, train, and cab with your preference.
          </p>

          <div className="mt-4 grid gap-3">
            <input
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="From city"
              className={`rounded-xl border px-3 py-2 text-sm outline-none ${isLight ? "border-neutral-900/10 bg-white text-neutral-900" : "border-white/10 bg-white/5 text-white"}`}
            />
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="To city"
              className={`rounded-xl border px-3 py-2 text-sm outline-none ${isLight ? "border-neutral-900/10 bg-white text-neutral-900" : "border-white/10 bg-white/5 text-white"}`}
            />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`rounded-xl border px-3 py-2 text-sm outline-none ${isLight ? "border-neutral-900/10 bg-white text-neutral-900" : "border-white/10 bg-white/5 text-white"}`}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PREFERENCES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreference(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${preference === item.id ? "saffron-gradient text-neutral-950" : isLight ? "border border-neutral-900/10 text-neutral-700" : "border border-white/15 text-white/80"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePlanTrip}
            disabled={!canSearch || loading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl saffron-gradient px-4 py-2.5 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {loading ? "Planning..." : "Get Trip Plan"}
          </button>

          {result ? (
            <div className={`mt-4 rounded-xl border p-3 ${isLight ? "border-neutral-900/10 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
              <p className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>{result.summary}</p>
              {result.details ? (
                <p className={`mt-1 text-xs ${isLight ? "text-neutral-600" : "text-white/60"}`}>{result.details}</p>
              ) : null}
              {result.alternatives?.length ? (
                <div className="mt-2">
                  <p className={`text-xs font-semibold ${isLight ? "text-neutral-700" : "text-white/80"}`}>Top price alternatives</p>
                  <ul className={`mt-1 space-y-1 text-xs ${isLight ? "text-neutral-600" : "text-white/65"}`}>
                    {result.alternatives.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {result.modeComparison?.length ? (
                <div className="mt-2">
                  <p className={`text-xs font-semibold ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                    Bus comparison
                  </p>
                  <ul className={`mt-1 space-y-1 text-xs ${isLight ? "text-neutral-600" : "text-white/65"}`}>
                    {result.modeComparison.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default TripPlannerChatbot;
