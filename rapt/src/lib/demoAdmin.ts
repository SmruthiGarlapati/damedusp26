export const DEMO_ADMIN_COOKIE = "rapt_demo_admin";

const DEMO_SESSION_AGE = 60 * 60 * 24 * 30;

export type DemoPersona = "admin" | "tani" | "sid";

export const DEMO_ADMIN_ID = "demo-admin";
export const DEMO_ADMIN_EMAIL = "admin@utexas.edu";
export const DEMO_ADMIN_PASSWORD = "admin123";

const DEMO_PERSONA_DEFS: Record<DemoPersona, { email: string; password: string; id: string }> = {
  admin: { email: "admin@utexas.edu", password: "admin123", id: "demo-admin" },
  tani:  { email: "tani@utexas.edu",  password: "tani123",  id: "demo-tani"  },
  sid:   { email: "sid@utexas.edu",   password: "sid123",   id: "demo-sid"   },
};

interface DemoProfile {
  id: string;
  full_name: string;
  email: string;
  overall_rating: number;
  preferences: Record<string, unknown>;
  availability: Record<string, unknown>;
  sessionsCompleted: number;
}

const DEMO_PROFILES: Record<DemoPersona, DemoProfile> = {
  admin: {
    id: "demo-admin",
    full_name: "RAPT Admin",
    email: "admin@utexas.edu",
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
  },
  tani: {
    id: "demo-tani",
    full_name: "Tani Sharma",
    email: "tani@utexas.edu",
    overall_rating: 4.8,
    preferences: {
      major: "Computer Science",
      year: "Junior",
      bio: "Love breaking down hard concepts by teaching them out loud.",
      techniques: ["Pomodoro", "Whiteboard", "Practice Problems"],
      group_size: "Small (2-3)",
      environment_type: "Silent (Library Level 5)",
      preferred_study_spot: "PCL Level 3",
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
    sessionsCompleted: 8,
  },
  sid: {
    id: "demo-sid",
    full_name: "Sid Kapoor",
    email: "sid@utexas.edu",
    overall_rating: 4.7,
    preferences: {
      major: "Computer Science",
      year: "Junior",
      bio: "Detail-oriented — I catch the gaps in my own understanding by rebuilding from scratch.",
      techniques: ["Practice Problems", "Whiteboard", "Pomodoro"],
      group_size: "Small (2-3)",
      environment_type: "Silent (Library Level 5)",
      preferred_study_spot: "PCL Level 3",
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
    sessionsCompleted: 6,
  },
};

function storageKey(persona: DemoPersona): string {
  if (persona === "admin") return "rapt.demo-admin.profile";
  return `rapt.demo.profile.${persona}`;
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

export function findDemoPersona(email: string, password: string): DemoPersona | null {
  for (const [persona, def] of Object.entries(DEMO_PERSONA_DEFS)) {
    if (email.trim().toLowerCase() === def.email && password === def.password) {
      return persona as DemoPersona;
    }
  }
  return null;
}

export function isDemoAdminCredentials(email: string, password: string) {
  return findDemoPersona(email, password) !== null;
}

export function getActiveDemoPersona(): DemoPersona | null {
  if (typeof document === "undefined") return null;
  const cookieParts = document.cookie.split(";").map((p) => p.trim());
  const part = cookieParts.find((p) => p.startsWith(`${DEMO_ADMIN_COOKIE}=`));
  if (!part) return null;
  const val = part.split("=")[1];
  if (!val || val === "0") return null;
  if (val === "1") return "admin";
  if (val in DEMO_PERSONA_DEFS) return val as DemoPersona;
  return null;
}

export function hasDemoAdminSession(): boolean {
  return getActiveDemoPersona() !== null;
}

export function isDemoAdminUser(user: { id: string } | null | undefined) {
  if (!user) return false;
  return Object.values(DEMO_PERSONA_DEFS).some((def) => def.id === user.id);
}

export function readDemoProfile(persona?: DemoPersona): DemoProfile {
  const p = persona ?? getActiveDemoPersona() ?? "admin";
  const base = DEMO_PROFILES[p];

  if (typeof window === "undefined") return { ...base };

  const raw = window.localStorage.getItem(storageKey(p));
  if (!raw) return { ...base };

  try {
    const parsed = JSON.parse(raw) as Partial<DemoProfile>;
    return {
      ...base,
      ...parsed,
      id: base.id,
      email: base.email,
      preferences: { ...base.preferences, ...(parsed.preferences ?? {}) },
      availability: { ...base.availability, ...(parsed.availability ?? {}) },
    };
  } catch {
    return { ...base };
  }
}

export function readDemoAdminProfile() {
  return readDemoProfile(getActiveDemoPersona() ?? "admin");
}

export function persistDemoProfile(profile: DemoProfile, persona?: DemoPersona) {
  if (typeof window === "undefined") return;
  const p = persona ?? getActiveDemoPersona() ?? "admin";
  window.localStorage.setItem(storageKey(p), JSON.stringify(profile));
}

export function persistDemoAdminProfile(profile: DemoProfile) {
  persistDemoProfile(profile);
}

export function updateDemoAdminProfile(patch: Partial<DemoProfile>) {
  const persona = getActiveDemoPersona() ?? "admin";
  const current = readDemoProfile(persona);
  const next: DemoProfile = {
    ...current,
    ...patch,
    id: current.id,
    email: current.email,
    preferences: { ...current.preferences, ...(patch.preferences ?? {}) },
    availability: { ...current.availability, ...(patch.availability ?? {}) },
  };
  persistDemoProfile(next, persona);
  return next;
}

export function activateDemoSession(persona: DemoPersona) {
  if (typeof document !== "undefined") {
    document.cookie = `${DEMO_ADMIN_COOKIE}=${persona}; Path=/; Max-Age=${DEMO_SESSION_AGE}; SameSite=Lax`;
  }

  if (typeof window !== "undefined" && !window.localStorage.getItem(storageKey(persona))) {
    window.localStorage.setItem(storageKey(persona), JSON.stringify(DEMO_PROFILES[persona]));
  }
}

export function activateDemoAdminSession() {
  activateDemoSession("admin");
}

export function clearDemoAdminSession() {
  if (typeof document !== "undefined") {
    document.cookie = `${DEMO_ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  if (typeof window !== "undefined") {
    for (const persona of Object.keys(DEMO_PERSONA_DEFS) as DemoPersona[]) {
      window.localStorage.removeItem(storageKey(persona));
    }
  }
}
