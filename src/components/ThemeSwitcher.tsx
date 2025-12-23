import { Theme, useTheme } from "@/contexts/ThemeContext";

type ThemeSwitcherProps = {
  onChanged?: () => void;
};

export default function ThemeSwitcher({ onChanged }: ThemeSwitcherProps) {
  const { theme, setTheme, isReady } = useTheme();

  function handleThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTheme(e.target.value as Theme);
    if (onChanged) {
      onChanged();
    }
  }

  if (!isReady) return null;

  return (
    <select className="form-select" value={theme} onChange={handleThemeChange}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
