import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light" | "pastel";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("nexis-theme");
    if (stored === "dark" || stored === "light" || stored === "pastel")
      return stored;
    return "dark";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("nexis-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
