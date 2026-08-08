
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

  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Role
  ) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type ProfileRow = {
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  department?: string;
  student_id?: string;
  studentId?: string;
  phone?: string;
  joined_at?: string;
  joinedAt?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type SupabaseAuthUser = {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
};

function normalizeRole(value: unknown): Role {
  if (value === "admin") return "admin";
  if (value === "faculty") return "faculty";
  return "student";
}

function getProfileValue(
  row: ProfileRow | null | undefined,
  keys: string[]
) {
  if (!row) return undefined;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function mapSupabaseUser(
  authUser: SupabaseAuthUser,
  profile?: ProfileRow | null
): User {
  const metadata = authUser.user_metadata ?? {};

  const nameFromProfile = getProfileValue(profile, [
    "name",
    "full_name",
    "display_name",
  ]);

  const departmentFromProfile = getProfileValue(profile, [
    "department",
  ]);

  const studentIdFromProfile = getProfileValue(profile, [
    "student_id",
    "studentId",
  ]);

  const phoneFromProfile = getProfileValue(profile, [
    "phone",
  ]);

  const joinedAtFromProfile = getProfileValue(profile, [
    "joined_at",
    "joinedAt",
  ]);

  const avatarFromProfile = getProfileValue(profile, [
    "avatar",
  ]);

  /*
   * IMPORTANT:
   * The profile role is the source of truth.
   * Only fall back to Auth metadata if there is no profile role.
   */
  const role = normalizeRole(
    profile?.role ?? metadata.role
  );

  const metadataName =
    typeof metadata.name === "string" &&
    metadata.name.trim()
      ? metadata.name.trim()
      : undefined;

  return {
    id: authUser.id,

    name:
      nameFromProfile ??
      metadataName ??
      authUser.email?.split("@")[0] ??
      "CampusPulse User",

    email: authUser.email ?? profile?.email ?? "",

    role,

    avatar:
      avatarFromProfile ??
      (typeof metadata.avatar === "string"
        ? metadata.avatar
        : undefined),

    department:
      departmentFromProfile ??
      (role === "admin"
        ? "Campus Operations"
        : role === "faculty"
          ? "Faculty"
          : "Computer Science"),

    studentId: studentIdFromProfile,

    phone: phoneFromProfile,

    joinedAt:
      joinedAtFromProfile ??
      authUser.created_at,
  };
}

async function fetchProfileForUser(
  userId: string
): Promise<ProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, name, full_name, email, role, department, student_id, phone, joined_at, avatar"
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      return null;
    }

    return (data as ProfileRow | null) ?? null;
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return null;
  }
}

async function ensureProfileForUser(
  authUser: SupabaseAuthUser,
  fallbackRole: Role = "student"
): Promise<ProfileRow | null> {
  const existingProfile = await fetchProfileForUser(authUser.id);

  if (existingProfile) {
    return existingProfile;
  }

  const metadata = authUser.user_metadata ?? {};

  const name =
    typeof metadata.name === "string" &&
    metadata.name.trim()
      ? metadata.name.trim()
      : authUser.email?.split("@")[0] ??
        "CampusPulse User";

  const department =
    fallbackRole === "admin"
      ? "Campus Operations"
      : fallbackRole === "faculty"
        ? "Faculty"
        : "Computer Science";

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: authUser.id,
          name,
          full_name: name,
          email: authUser.email ?? "",
          role: fallbackRole,
          department,
          joined_at: authUser.created_at,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error("Could not create profile:", error);
      return null;
    }

    return (data as ProfileRow | null) ?? null;
  } catch (error) {
    console.error("Profile creation failed:", error);
    return null;
  }
}

async function hydrateUser(
  authUser: SupabaseAuthUser,
  fallbackRole: Role = "student"
): Promise<User> {
  let profile = await fetchProfileForUser(authUser.id);

  if (!profile) {
    profile = await ensureProfileForUser(
      authUser,
      fallbackRole
    );
  }

  return mapSupabaseUser(authUser, profile);
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const hydratedUser = await hydrateUser(
          authUser
        );

        if (!isMounted) return;

        setUser(hydratedUser);
      } catch (error) {
        console.error("Failed to load user:", error);

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        if (!session?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        /*
         * Use the actual Supabase user ID from the session.
         * Never reuse an old/local user here.
         */
        const hydratedUser = await hydrateUser(
          session.user
        );

        if (!isMounted) return;

        setUser(hydratedUser);
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,

      isAuthenticated: !!user,

      isLoading,

      async login(email, password) {
        const cleanEmail = email
          .trim()
          .toLowerCase();

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error(
            "Login failed. Please try again."
          );
        }

        /*
         * Get the profile belonging specifically
         * to this Supabase Auth user ID.
         */
        const loggedInUser = await hydrateUser(
          data.user
        );

        setUser(loggedInUser);

        return loggedInUser;
      },

      async register(
        name,
        email,
        password,
        role
      ) {
        const cleanName = name.trim();
        const cleanEmail = email
          .trim()
          .toLowerCase();

        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,

            options: {
              data: {
                name: cleanName,
                role,
                department:
                  role === "admin"
                    ? "Campus Operations"
                    : role === "faculty"
                      ? "Faculty"
                      : "Computer Science",
              },
            },
          });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user) {
          throw new Error(
            "Account creation failed. Please try again."
          );
        }

        /*
         * Create the profile using the NEW user's
         * Supabase UUID.
         */
        const profile = await ensureProfileForUser(
          data.user,
          role
        );

        const registeredUser = mapSupabaseUser(
          data.user,
          profile
        );

        /*
         * If email confirmation is enabled,
         * Supabase returns a user but NO session.
         *
         * Therefore don't pretend the user is logged in.
         */
        if (data.session) {
          setUser(registeredUser);
        } else {
          setUser(null);
        }

        return registeredUser;
      },

      async logout() {
        const { error } =
          await supabase.auth.signOut();

        if (error) {
          throw new Error(error.message);
        }

        setUser(null);
      },

      async updateProfile(patch) {
        if (!user) {
          throw new Error(
            "No user is currently logged in."
          );
        }

        const updatedUser: User = {
          ...user,
          ...patch,
        };

        /*
         * Update Supabase Auth metadata.
         */
        const { error: authError } =
          await supabase.auth.updateUser({
            data: {
              name: updatedUser.name,
              role: updatedUser.role,
              avatar: updatedUser.avatar,
              department: updatedUser.department,
              studentId: updatedUser.studentId,
              phone: updatedUser.phone,
              joinedAt: updatedUser.joinedAt,
            },
          });

        if (authError) {
          throw new Error(authError.message);
        }

        /*
         * Update the actual profiles table too.
         */
        const { error: profileError } =
          await supabase
            .from("profiles")
            .update({
              name: updatedUser.name,
              full_name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              department:
                updatedUser.department,
              student_id:
                updatedUser.studentId ?? null,
              phone:
                updatedUser.phone ?? null,
              avatar:
                updatedUser.avatar ?? null,
              joined_at:
                updatedUser.joinedAt,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", user.id);

        if (profileError) {
          console.error(
            "Profile table update failed:",
            profileError
          );
        }

        setUser(updatedUser);
      },
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

