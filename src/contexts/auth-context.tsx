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

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

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

/* ---------------------------------------------------------
   ROLE HELPERS
--------------------------------------------------------- */

function normalizeRole(value: unknown): Role | null {
  if (value === "admin") return "admin";
  if (value === "faculty") return "faculty";
  if (value === "student") return "student";

  return null;
}

function getProfileValue(
  row: ProfileRow | null | undefined,
  keys: string[]
): string | undefined {
  if (!row) return undefined;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

/* ---------------------------------------------------------
   SUPABASE USER -> CAMPUSPULSE USER
--------------------------------------------------------- */

function mapSupabaseUser(
  authUser: SupabaseAuthUser,
  profile?: ProfileRow | null
): User {
  const metadata = authUser.user_metadata ?? {};

  const profileRole = normalizeRole(profile?.role);

  const metadataRole = normalizeRole(metadata.role);

  /*
   * Priority:
   *
   * 1. profiles.role
   * 2. auth metadata role
   * 3. student
   *
   * The database profile is the main source of truth.
   */
  const role: Role =
    profileRole ??
    metadataRole ??
    "student";

  const nameFromProfile = getProfileValue(profile, [
    "name",
    "full_name",
    "display_name",
  ]);

  const metadataName =
    typeof metadata.name === "string" &&
    metadata.name.trim()
      ? metadata.name.trim()
      : undefined;

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

  const metadataAvatar =
    typeof metadata.avatar === "string"
      ? metadata.avatar
      : undefined;

  return {
    id: authUser.id,

    name:
      nameFromProfile ??
      metadataName ??
      authUser.email?.split("@")[0] ??
      "CampusPulse User",

    email:
      authUser.email ??
      profile?.email ??
      "",

    role,

    avatar:
      avatarFromProfile ??
      metadataAvatar,

    department:
      departmentFromProfile ??
      (role === "admin"
        ? "Campus Operations"
        : role === "faculty"
          ? "Faculty"
          : "Computer Science"),

    studentId:
      studentIdFromProfile,

    phone:
      phoneFromProfile,

    joinedAt:
      joinedAtFromProfile ??
      authUser.created_at,
  };
}

/* ---------------------------------------------------------
   GET PROFILE
--------------------------------------------------------- */

async function fetchProfileForUser(
  userId: string
): Promise<ProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          name,
          full_name,
          email,
          role,
          department,
          student_id,
          phone,
          joined_at,
          avatar
        `
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Error loading profile:",
        error
      );

      return null;
    }

    return (
      (data as ProfileRow | null) ??
      null
    );
  } catch (error) {
    console.error(
      "Profile fetch failed:",
      error
    );

    return null;
  }
}

/* ---------------------------------------------------------
   CREATE PROFILE IF IT DOES NOT EXIST
--------------------------------------------------------- */

async function ensureProfileForUser(
  authUser: SupabaseAuthUser,
  fallbackRole: Role
): Promise<ProfileRow | null> {
  const existingProfile =
    await fetchProfileForUser(authUser.id);

  if (existingProfile) {
    return existingProfile;
  }

  const metadata =
    authUser.user_metadata ?? {};

  const metadataName =
    typeof metadata.name === "string" &&
    metadata.name.trim()
      ? metadata.name.trim()
      : undefined;

  const name =
    metadataName ??
    authUser.email?.split("@")[0] ??
    "CampusPulse User";

  const department =
    fallbackRole === "admin"
      ? "Campus Operations"
      : fallbackRole === "faculty"
        ? "Faculty"
        : "Computer Science";

  try {
    const { data, error } =
      await supabase
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
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        )
        .select()
        .maybeSingle();

    if (error) {
      console.error(
        "Could not create profile:",
        error
      );

      return null;
    }

    return (
      (data as ProfileRow | null) ??
      null
    );
  } catch (error) {
    console.error(
      "Profile creation failed:",
      error
    );

    return null;
  }
}

/* ---------------------------------------------------------
   HYDRATE AUTH USER
--------------------------------------------------------- */

async function hydrateUser(
  authUser: SupabaseAuthUser,
  fallbackRole: Role = "student"
): Promise<User> {
  let profile =
    await fetchProfileForUser(authUser.id);

  /*
   * If no profile exists, create one.
   */
  if (!profile) {
    profile =
      await ensureProfileForUser(
        authUser,
        fallbackRole
      );
  }

  return mapSupabaseUser(
    authUser,
    profile
  );
}

/* ---------------------------------------------------------
   AUTH PROVIDER
--------------------------------------------------------- */

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

    /*
     * Load the currently authenticated
     * Supabase user when the app starts.
     */
    async function loadUser() {
      try {
        const {
          data: { user: authUser },
          error,
        } =
          await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const hydratedUser =
          await hydrateUser(authUser);

        if (!isMounted) return;

        setUser(hydratedUser);
      } catch (error) {
        console.error(
          "Failed to load user:",
          error
        );

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

    /*
     * Listen for Supabase authentication changes.
     */
    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!isMounted) return;

          /*
           * User signed out.
           */
          if (!session?.user) {
            setUser(null);
            setIsLoading(false);
            return;
          }

          try {
            /*
             * IMPORTANT:
             * Always use the user from the CURRENT
             * Supabase session.
             */
            const hydratedUser =
              await hydrateUser(
                session.user
              );

            if (!isMounted) return;

            setUser(hydratedUser);
          } catch (error) {
            console.error(
              "Failed to hydrate auth user:",
              error
            );
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        }
      );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        isAuthenticated:
          !!user,

        isLoading,

        /* -------------------------------------------------
           LOGIN
        ------------------------------------------------- */

        async login(
          email,
          password
        ) {
          const cleanEmail =
            email
              .trim()
              .toLowerCase();

          const {
            data,
            error,
          } =
            await supabase.auth.signInWithPassword(
              {
                email: cleanEmail,
                password,
              }
            );

          if (error) {
            throw new Error(
              error.message
            );
          }

          if (!data.user) {
            throw new Error(
              "Login failed. Please try again."
            );
          }

          /*
           * Get THIS user's profile using
           * THIS user's Supabase UUID.
           */
          const loggedInUser =
            await hydrateUser(
              data.user
            );

          setUser(loggedInUser);

          return loggedInUser;
        },

        /* -------------------------------------------------
           REGISTER
        ------------------------------------------------- */

        async register(
          name,
          email,
          password,
          role
        ) {
          const cleanName =
            name.trim();

          const cleanEmail =
            email
              .trim()
              .toLowerCase();

          /*
           * Make sure only valid roles
           * are sent to Supabase.
           */
          const selectedRole =
            normalizeRole(role);

          if (!selectedRole) {
            throw new Error(
              "Invalid account role."
            );
          }

          const department =
            selectedRole === "admin"
              ? "Campus Operations"
              : selectedRole === "faculty"
                ? "Faculty"
                : "Computer Science";

          /*
           * Create Supabase Auth account.
           */
          const {
            data,
            error,
          } =
            await supabase.auth.signUp({
              email: cleanEmail,
              password,

              options: {
                data: {
                  name: cleanName,
                  role: selectedRole,
                  department,
                },
              },
            });

          if (error) {
            throw new Error(
              error.message
            );
          }

          if (!data.user) {
            throw new Error(
              "Account creation failed. Please try again."
            );
          }

          /*
           * Make sure the profile exists.
           */
          await ensureProfileForUser(
            data.user,
            selectedRole
          );

          /*
           * CRITICAL FIX:
           *
           * If a profile was already created
           * automatically by a Supabase trigger,
           * it may have role = "student".
           *
           * We explicitly set the role selected
           * during registration.
           */
          const {
            data: updatedProfile,
            error: roleError,
          } =
            await supabase
              .from("profiles")
              .update({
                role: selectedRole,
                name: cleanName,
                full_name: cleanName,
                email:
                  data.user.email ??
                  cleanEmail,
                department,
                updated_at:
                  new Date().toISOString(),
              })
              .eq("id", data.user.id)
              .select()
              .maybeSingle();

          if (roleError) {
            console.error(
              "Could not save user role:",
              roleError
            );

            throw new Error(
              `Account created, but the role could not be saved: ${roleError.message}`
            );
          }

          /*
           * Build the CampusPulse user
           * using the UPDATED profile.
           */
          const registeredUser =
            mapSupabaseUser(
              data.user,
              (updatedProfile as ProfileRow | null) ??
                null
            );

          /*
           * If email confirmation is disabled,
           * Supabase returns a session and the
           * user is immediately logged in.
           *
           * If confirmation is enabled,
           * there is no session yet.
           */
          if (data.session) {
            setUser(
              registeredUser
            );
          } else {
            setUser(null);
          }

          return registeredUser;
        },

        /* -------------------------------------------------
           LOGOUT
        ------------------------------------------------- */

        async logout() {
          const {
            error,
          } =
            await supabase.auth.signOut();

          if (error) {
            throw new Error(
              error.message
            );
          }

          setUser(null);
        },

        /* -------------------------------------------------
           UPDATE PROFILE
        ------------------------------------------------- */

        async updateProfile(
          patch
        ) {
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
          const {
            error: authError,
          } =
            await supabase.auth.updateUser({
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

          if (authError) {
            throw new Error(
              authError.message
            );
          }

          /*
           * Update the profiles table.
           */
          const {
            error: profileError,
          } =
            await supabase
              .from("profiles")
              .update({
                name:
                  updatedUser.name,

                full_name:
                  updatedUser.name,

                email:
                  updatedUser.email,

                role:
                  updatedUser.role,

                department:
                  updatedUser.department,

                student_id:
                  updatedUser.studentId ??
                  null,

                phone:
                  updatedUser.phone ??
                  null,

                avatar:
                  updatedUser.avatar ??
                  null,

                joined_at:
                  updatedUser.joinedAt,

                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                user.id
              );

          if (profileError) {
            console.error(
              "Profile table update failed:",
              profileError
            );

            throw new Error(
              `Profile update failed: ${profileError.message}`
            );
          }

          setUser(updatedUser);
        },
      }),
      [user, isLoading]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------------------------------------
   USE AUTH
--------------------------------------------------------- */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}