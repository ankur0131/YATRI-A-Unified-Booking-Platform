import { useCallback, useEffect, useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("yatri-theme") || "dark");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("yatri-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

export default useTheme;
