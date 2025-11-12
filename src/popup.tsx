import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router";
import browser from "webextension-polyfill";
import AppRoutes from "./routes/AppRoutes";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [storageType, setStorageType] = useState<"local" | "cloud" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from chrome.storage
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      let savedStorageType: "local" | "cloud" | null = null;
      let accessToken: string | null = null;
      let userInfo: string | null = null;

      // Try to use chrome.storage if available (production)
      if (typeof browser !== "undefined" && browser.storage?.local) {
        const result = await browser.storage.local.get([
          "storageType",
          "accessToken",
          "userInfo",
        ]);
        savedStorageType = result.storageType as "local" | "cloud" | null;
        accessToken = result.accessToken;
        userInfo = result.userInfo;
      }

      // Fallback to localStorage (development or if chrome.storage not available)
      if (!savedStorageType) {
        savedStorageType = localStorage.getItem("storageType") as
          | "local"
          | "cloud"
          | null;
        accessToken = localStorage.getItem("accessToken");
        userInfo = localStorage.getItem("userInfo");
      }

      // Sync with localStorage for compatibility
      if (savedStorageType) {
        localStorage.setItem("storageType", savedStorageType);
      }
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (userInfo) {
        localStorage.setItem("userInfo", userInfo);
      }

      // If user has valid cloud credentials but no storage type set, set it
      if (!savedStorageType && accessToken && userInfo) {
        if (typeof browser !== "undefined" && browser.storage?.local) {
          await browser.storage.local.set({ storageType: "cloud" });
        }
        localStorage.setItem("storageType", "cloud");
        setStorageType("cloud");
      } else {
        setStorageType(savedStorageType);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to localStorage on error
      const savedStorageType = localStorage.getItem("storageType") as
        | "local"
        | "cloud"
        | null;
      setStorageType(savedStorageType);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStorageSelection = async (type: "local" | "cloud") => {
    if (type === "local") {
      // Save preference and redirect to dashboard immediately
      if (typeof browser !== "undefined" && browser.storage?.local) {
        await browser.storage.local.set({ storageType: type });
      }
      localStorage.setItem("storageType", type);
      setStorageType(type);
    }
    // For cloud, navigation is handled by the Login component (redirect to CloudLogin)
  };

  const handleCloudLogin = async (email: string, password: string) => {
    console.log("Cloud login:", email);
    if (typeof browser !== "undefined" && browser.storage?.local) {
      await browser.storage.local.set({ storageType: "cloud" });
    }
    localStorage.setItem("storageType", "cloud");
    setStorageType("cloud");
  };

  const getInitialRoute = () => {
    // Check if user is logged in with cloud (has access token)
    const accessToken = localStorage.getItem("accessToken");
    const userInfo = localStorage.getItem("userInfo");

    if (storageType === "cloud" && accessToken && userInfo) {
      return "/dashboard";
    }

    // Check if user selected local storage
    if (storageType === "local") {
      return "/dashboard";
    }

    return "/";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <MemoryRouter initialEntries={[getInitialRoute()]}>
      <AppRoutes
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectStorage={handleStorageSelection}
        onCloudLogin={handleCloudLogin}
      />
    </MemoryRouter>
  );
}

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
