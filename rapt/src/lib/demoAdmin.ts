export const DEMO_ADMIN_ID = "demo-admin";
export const DEMO_ADMIN_EMAIL = "admin@utexas.edu";
export const DEMO_ADMIN_PASSWORD = "admin123";
export const DEMO_ADMIN_COOKIE = "rapt_demo_admin";

const DEMO_ADMIN_STORAGE_KEY = "rapt.demo-admin.profile";
const DEMO_ADMIN_SESSION_AGE = 60 * 60 * 24 * 30;

interface DemoAdminProfile {
  id: string;
  full_name: string;
  email: string;
  overall_rating: number;
  preferences: Record<string, unknown>;
  availability: Record<string, unknown>;
  sessionsCompleted: number;
}

const DEFAULT_DEMO_ADMIN_PROFILE: DemoAdminProfile = {
  id: DEMO_ADMIN_ID,
  full_name: "RAPT Admin",
  email: DEMO_ADMIN_EMAIL,
  overall_rating: 4.9,
  preferences: {
    major: "Computer Science",
    year: "Senior",
    bio: "Running the demo workspace and testing study flows end to end.",
    techniques: ["Pomodoro", "Practice Problems", "Whiteboard"],
    group_size: "Small (2-3)",
    environment_type: "Silent (Library Level 5)",
    preferred_study_spot: "PCL (Library)",
    notifications: {
      sessionRequests: true,
      sessionAccepted: true,
      sessionReminders: true,
      messages: true,
      weeklyDigest: false,
      marketingEmails: false,
    },
  },
  availability: {},
  sessionsCompleted: 12,
};

function cloneDefaultDemoAdminProfile(): DemoAdminProfile {
  return JSON.parse(JSON.stringify(DEFAULT_DEMO_ADMIN_PROFILE)) as DemoAdminProfile;
}

function mergeDemoAdminProfile(
  base: DemoAdminProfile,
  patch: Partial<DemoAdminProfile>
): DemoAdminProfile {
  return {
    ...base,
    ...patch,
    id: DEMO_ADMIN_ID,
    email: DEMO_ADMIN_EMAIL,
    preferences: {
      ...base.preferences,
      ...(patch.preferences ?? {}),
    },
    availability: {
      ...base.availability,
      ...(patch.availability ?? {}),
    },
  };
}

export function isSupabaseAuthConfigured() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-supabase")
  );
}

export function isDemoAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD;
}

export function isDemoAdminUser(user: { id: string } | null | undefined) {
  return user?.id === DEMO_ADMIN_ID;
}

export function readDemoAdminProfile() {
  if (typeof window === "undefined") {
    return cloneDefaultDemoAdminProfile();
  }

  const raw = window.localStorage.getItem(DEMO_ADMIN_STORAGE_KEY);
  if (!raw) {
    return cloneDefaultDemoAdminProfile();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoAdminProfile>;
    return mergeDemoAdminProfile(cloneDefaultDemoAdminProfile(), parsed);
  } catch {
    return cloneDefaultDemoAdminProfile();
  }
}

export function persistDemoAdminProfile(profile: DemoAdminProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_ADMIN_STORAGE_KEY, JSON.stringify(profile));
}

export function updateDemoAdminProfile(patch: Partial<DemoAdminProfile>) {
  const nextProfile = mergeDemoAdminProfile(readDemoAdminProfile(), patch);
  persistDemoAdminProfile(nextProfile);
  return nextProfile;
}

export function activateDemoAdminSession() {
  if (typeof document !== "undefined") {
    document.cookie = `${DEMO_ADMIN_COOKIE}=1; Path=/; Max-Age=${DEMO_ADMIN_SESSION_AGE}; SameSite=Lax`;
  }

  if (typeof window !== "undefined" && !window.localStorage.getItem(DEMO_ADMIN_STORAGE_KEY)) {
    persistDemoAdminProfile(cloneDefaultDemoAdminProfile());
  }
}

export function clearDemoAdminSession() {
  if (typeof document !== "undefined") {
    document.cookie = `${DEMO_ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
  }
}

export function hasDemoAdminSession() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${DEMO_ADMIN_COOKIE}=1`);
}
