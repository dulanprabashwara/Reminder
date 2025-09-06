import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const lightTheme = {
  background: "#ffffff",
  surface: "#f8f8f8",
  text: "#333333",
  textSecondary: "#666666",
  border: "#dddddd",
  primary: "#007AFF",
};

export const darkTheme = {
  background: "#121212",
  surface: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#cccccc",
  border: "#333333",
  primary: "#0A84FF",
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
