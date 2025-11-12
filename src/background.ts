import browser from "webextension-polyfill";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, TIMING } from "./config/constants";

const ALARM_NAME = "token_refresh";

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  checkAndScheduleTokenRefresh();
});

// Listen for extension startup (browser restart)
browser.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  checkAndScheduleTokenRefresh();
});

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCHEDULE_TOKEN_REFRESH") {
    const { expiresIn } = message.payload;
    scheduleTokenRefresh(expiresIn);
  } else if (message.type === "CANCEL_TOKEN_REFRESH") {
    cancelTokenRefresh();
  }
  return true; // Keep the message channel open for async response
});

// Listen for alarm
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log("Token refresh alarm triggered");
    await refreshAccessToken();
  }
});

// Schedule token refresh alarm
function scheduleTokenRefresh(expiresIn: number) {
  // Schedule alarm at 90% of expiry time (in minutes)
  const refreshTimeMinutes = Math.max((expiresIn * TIMING.TOKEN_REFRESH_PERCENTAGE) / 60, 1);
  
  console.log(`Scheduling token refresh in ${refreshTimeMinutes} minutes`);
  
  browser.alarms.create(ALARM_NAME, {
    delayInMinutes: refreshTimeMinutes,
  });
  
  // Store the expiry time for checking on startup
  browser.storage.local.set({
    [STORAGE_KEYS.TOKEN_EXPIRES_AT]: Date.now() + (expiresIn * 1000),
  });
}

// Cancel token refresh alarm
function cancelTokenRefresh() {
  browser.alarms.clear(ALARM_NAME);
  browser.storage.local.remove(STORAGE_KEYS.TOKEN_EXPIRES_AT);
}

// Check if token needs refresh on startup
async function checkAndScheduleTokenRefresh() {
  const result = await browser.storage.local.get([
    STORAGE_KEYS.TOKEN_EXPIRES_AT,
    STORAGE_KEYS.REFRESH_TOKEN
  ]);
  
  if (result[STORAGE_KEYS.REFRESH_TOKEN] && result[STORAGE_KEYS.TOKEN_EXPIRES_AT]) {
    const now = Date.now();
    const timeUntilExpiry = (result[STORAGE_KEYS.TOKEN_EXPIRES_AT] - now) / 1000; // in seconds
    
    if (timeUntilExpiry > 0) {
      // Token still valid, schedule refresh
      scheduleTokenRefresh(timeUntilExpiry);
    } else {
      // Token already expired, refresh immediately
      await refreshAccessToken();
    }
  }
}

// Refresh the access token
async function refreshAccessToken() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.REFRESH_TOKEN);
    const refreshToken = result[STORAGE_KEYS.REFRESH_TOKEN];
    
    if (!refreshToken) {
      console.error("No refresh token found");
      return false;
    }

    const response = await fetch(API_BASE_URL + API_ENDPOINTS.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    
    // Update the tokens in storage
    await browser.storage.local.set({
      [STORAGE_KEYS.ACCESS_TOKEN]: data.accessToken,
    });
    
    // Update refresh token if a new one is provided
    if (data.refreshToken) {
      await browser.storage.local.set({
        [STORAGE_KEYS.REFRESH_TOKEN]: data.refreshToken,
      });
    }
    
    // Schedule the next refresh
    if (data.expiresIn || data.expires_in) {
      const expiresIn = data.expiresIn || data.expires_in;
      scheduleTokenRefresh(expiresIn);
    }

    console.log("Token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    
    // If refresh fails, clear all auth data
    await browser.storage.local.remove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_INFO,
      STORAGE_KEYS.TOKEN_EXPIRES_AT,
      STORAGE_KEYS.STORAGE_TYPE
    ]);
    cancelTokenRefresh();
    
    return false;
  }
}
