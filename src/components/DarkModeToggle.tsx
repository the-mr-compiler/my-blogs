import { useContext } from "react";
import { DARK, LIGHT, ThemeContext } from "../state/ThemeContext";

const DarkModeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleToggle = (e: { target: { checked: any } }) => {
    setTheme(e.target.checked ? DARK : LIGHT);

    document.documentElement.setAttribute(
      "data-theme",
      e.target.checked ? DARK : LIGHT,
    );
  };

  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        className="theme-controller"
        checked={theme === DARK}
        onChange={handleToggle}
        value={theme === DARK ? DARK : LIGHT}
        aria-label="Toggle dark mode"
      />
      <div className="swap-on">
        {/* Moon icon for dark mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
          />
        </svg>
      </div>
      <div className="swap-off">
        {/* Sun icon for light mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07 4.93l-.71-.71M6.34 6.34l-.71-.71m12.02 12.02l-.71-.71M6.34 17.66l-.71-.71M12 5a7 7 0 100 14a7 7 0 000-14z"
          />
        </svg>
      </div>
    </label>
  );
};

export default DarkModeToggle;
