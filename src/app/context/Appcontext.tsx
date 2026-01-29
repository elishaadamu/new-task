"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import axios from "axios";

// Secret key for encryption (change this to a more secure key in production)
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key-here";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  token?: string; // Potential token
}

interface AppContextType {
  userData: UserData | null;
  isLoading: boolean;
  setEncryptedUserData: (data: any) => void;
  getDecryptedUserData: () => any;
  clearUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("admin_user_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.encrypted) {
          const decrypted = CryptoJS.AES.decrypt(
            parsed.encrypted,
            ENCRYPTION_KEY,
          ).toString(CryptoJS.enc.Utf8);
          setUserData(JSON.parse(decrypted));
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage when userData changes (Redundant - handled in set/clear functions)

  // Axios interceptor to handle session expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          clearUserData();
          router.push("/auth/login");
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Encrypt data using AES encryption
  const setEncryptedUserData = (data: UserData) => {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(
        jsonString,
        ENCRYPTION_KEY,
      ).toString();
      const storageData = {
        encrypted,
        iv: CryptoJS.lib.WordArray.random(128 / 8).toString(),
      };
      // We store the raw data in state for easy access, but the encrypted version in localStorage
      setUserData(data);
      localStorage.setItem("admin_user_data", JSON.stringify(storageData));
    } catch (error) {
      console.error("Encryption error:", error);
    }
  };

  // Decrypt data (kept for compatibility or explicit retrieval)
  const getDecryptedUserData = () => {
    return userData;
  };

  // Clear user data
  const clearUserData = () => {
    setUserData(null);
    localStorage.removeItem("admin_user_data");
    router.push("/auth/login");
  };

  return (
    <AppContext.Provider
      value={{
        userData,
        isLoading,
        setEncryptedUserData,
        getDecryptedUserData,
        clearUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
