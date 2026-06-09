import Navbar from "./Navbar";
import TripPlannerChatbot from "./TripPlannerChatbot";
import { useAuth } from "../context/AuthContext";

function PageShell({ theme, onToggleTheme, children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="relative min-h-screen">
      <div className="ambient-orb left-[-7rem] top-[-5rem] h-64 w-64 bg-[#FF9933]/18" />
      <div className="ambient-orb bottom-[-7rem] right-[-4rem] h-72 w-72 bg-[#FFC107]/14" />
      <div className="noise-mask" />
      <div className="relative z-10">
        <Navbar theme={theme} onToggleTheme={onToggleTheme} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        {!isAdmin ? <TripPlannerChatbot theme={theme} /> : null}
      </div>
    </div>
  );
}

export default PageShell;
