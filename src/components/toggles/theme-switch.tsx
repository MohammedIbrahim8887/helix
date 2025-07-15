"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
  { key: "system", icon: Monitor, label: "System" },
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative flex h-10 rounded-full bg-gray-100 dark:bg-gray-800 p-1 border">
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className="relative h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 rounded-full bg-white dark:bg-gray-700 shadow-sm"
                transition={{ type: "spring", duration: 0.4 }}
              />
            )}
            <Icon
              className={`relative h-4 w-4 ${
                isActive
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
