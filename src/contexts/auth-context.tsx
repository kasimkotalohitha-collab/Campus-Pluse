import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<User>;

  register: (
    name: string,
    email: string,
    password: string,
    role: Role,
  ) => Promise<User>;

  logout: () => Promise<void>;

  updateProfile: (
    patch: Partial<User>,
  ) => Promise<void>;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

function mapSupabaseUser(authUser: {
  id: string;
  email?: string;
  created_at: string;
  user_metadata: Record<string, unknown>;
}): User {
  const metadata = authUser.user_metadata ?? {};

  const storedRole = metadata.role;

  const role: Role =
    storedRole === "admin"
      ? "admin"
      : storedRole === "faculty"
        ? "faculty"
        : "student";

  return {
    id: authUser.id,

    name:
      typeof metadata.name === "string" &&
      metadata.name.trim()
        ? metadata.name.trim()
        : authUser.email?.split("@")[0] ??
          "CampusPulse User",

    email: authUser.email ?? "",

    role,

    avatar:
      typeof metadata.avatar === "string"
        ? metadata.avatar
        : undefined,

    department:
      typeof metadata.department === "string"
        ? metadata.department
        : role === "admin"
          ? "Campus Operations"
          : role === "faculty"
            ? "Faculty"
            : "Computer Science",

    studentId:
      typeof metadata.studentId === "string"
        ? metadata.studentId
        : undefined,

    phone:
      typeof metadata.phone === "string"
        ? metadata.phone
        : undefined,

    joinedAt:
      typeof metadata.joinedAt === "string"
        ? metadata.joinedAt
        : authUser.created_at,
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: {
          user: authUser,
        },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          "Could not load authenticated user:",
          error,
        );

        setUser(null);
      } else {
        setUser(
          authUser
            ? mapSupabaseUser(authUser)
            : null,
        );
      }

      setIsLoading(false);
    }

    loadUser();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session,
        ) => {
          if (!isMounted) {
            return;
          }

          setUser(
            session?.user
              ? mapSupabaseUser(
                  session.user,
                )
              : null,
          );

          setIsLoading(false);
        },
      );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      isAuthenticated:
        !!user,

      isLoading,

      async login(
        email,
        password,
      ) {
        const {
          data,
          error,
        } =
          await supabase.auth
            .signInWithPassword({
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            });

        if (error) {
          throw new Error(
            error.message,
          );
        }

        if (!data.user) {
          throw new Error(
            "Login failed. Please try again.",
          );
        }

        const loggedInUser =
          mapSupabaseUser(
            data.user,
          );

        setUser(
          loggedInUser,
        );

        return loggedInUser;
      },

      async register(
        name,
        email,
        password,
        role,
      ) {
        const joinedAt =
          new Date()
            .toISOString();

        const {
          data,
          error,
        } =
          await supabase.auth
            .signUp({
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,

              options: {
                data: {
                  name:
                    name.trim(),

                  role,

                  department:
                    role ===
                    "admin"
                      ? "Campus Operations"
                      : role ===
                        "faculty"
                        ? "Faculty"
                        : "Computer Science",

                  joinedAt,
                },
              },
            });

        if (error) {
          throw new Error(
            error.message,
          );
        }

        if (!data.user) {
          throw new Error(
            "Account creation failed. Please try again.",
          );
        }

        const registeredUser =
          mapSupabaseUser(
            data.user,
          );

        setUser(
          registeredUser,
        );

        return registeredUser;
      },

      async logout() {
        const {
          error,
        } =
          await supabase.auth
            .signOut();

        if (error) {
          throw new Error(
            error.message,
          );
        }

        setUser(null);
      },

      async updateProfile(
        patch,
      ) {
        if (!user) {
          throw new Error(
            "No user is currently logged in.",
          );
        }

        const updatedUser: User = {
          ...user,
          ...patch,
        };

        const {
          error,
        } =
          await supabase.auth
            .updateUser({
              data: {
                name:
                  updatedUser.name,

                role:
                  updatedUser.role,

                avatar:
                  updatedUser.avatar,

                department:
                  updatedUser.department,

                studentId:
                  updatedUser.studentId,

                phone:
                  updatedUser.phone,

                joinedAt:
                  updatedUser.joinedAt,
              },
            });

        if (error) {
          throw new Error(
            error.message,
          );
        }

        setUser(
          updatedUser,
        );
      },
    }),
    [
      user,
      isLoading,
    ],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
}