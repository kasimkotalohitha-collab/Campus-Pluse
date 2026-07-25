import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockUsers } from "@/lib/mock-data";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "campuspulse.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user, ready]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      async login(email) {
        const found =
          mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
          (email.includes("admin") ? mockUsers[1] : mockUsers[0]);
        setUser(found);
        return found;
      },
      async register(name, email, _password, role) {
        const newUser: User = {
          id: `u-${Date.now()}`,
          name,
          email,
          role,
          joinedAt: new Date().toISOString(),
          department: role === "admin" ? "Campus Operations" : "Computer Science",
        };
        setUser(newUser);
        return newUser;
      },
      logout() {
        setUser(null);
      },
      updateProfile(patch) {
        setUser((prev) => (prev ? { ...prev, ...patch } : prev));
      },
    }),
    [user],
  );

  if (!ready) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
