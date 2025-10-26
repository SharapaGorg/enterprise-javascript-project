import { getCurrentInstance, computed } from "vue";

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  onboarded: boolean;
  needsOnboarding: boolean;
  _loaded: boolean;
};

const LS_KEY = "app-auth-v1";
const USERS_KEY = "app-users-v1";
type StoredUsers = Record<string, { name?: string; onboarded: boolean }>;

function loadUsers(): StoredUsers {
  if (!process.client) return {};
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveUsers(users: StoredUsers) {
  if (!process.client) return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function useAuth() {
  const state = useState<AuthState>("auth", () => ({
    user: null,
    token: null,
    onboarded: false,
    needsOnboarding: false,
    _loaded: false,
  }));

  const assign = (patch: Partial<AuthState>) =>
    Object.assign(state.value, patch);

  function save() {
    if (!process.client) return;
    try {
      const { _loaded, ...toSave } = state.value;
      window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch {}
  }

  function loadOnce() {
    if (state.value._loaded) return;
    if (process.server) {
      assign({ _loaded: true });
      return;
    }
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Omit<AuthState, "_loaded">;
        assign({ ...data, _loaded: true });
      } else {
        assign({ _loaded: true });
      }
    } catch {
      assign({ _loaded: true });
    }
  }

  if (process.client) {
    if (getCurrentInstance()) {
      queueMicrotask(loadOnce);
    } else {
      loadOnce();
    }
  }

  // Заглушки
  async function apiLogin(payload: { email: string; password: string }) {
    // TODO: backend POST /login
    if (!payload.email || !payload.password)
      throw new Error("Invalid credentials");
    return {
      token: "fake-token",
      user: {
        id: "u1",
        email: payload.email,
        name: payload.email.split("@")[0],
      },
    };
  }

  async function apiRegister(payload: {
    email: string;
    password: string;
    name?: string;
  }) {
    // TODO: backend POST /register
    if (!payload.email || !payload.password) throw new Error("Fill all fields");
    return {
      token: "fake-token",
      user: { id: "u1", email: payload.email, name: payload.name || "User" },
      needsOnboarding: true,
    };
  }

  async function login(email: string, password: string) {
    const res = await apiLogin({ email, password });

    const users = loadUsers();
    const stored = users[email];
    const onboarded = stored ? stored.onboarded : true;

    assign({
      user: { ...res.user, name: stored?.name ?? res.user.name },
      token: res.token,
      needsOnboarding: !onboarded,
      onboarded,
    });
    save();
  }

  async function register(email: string, password: string, name?: string) {
    const res = await apiRegister({ email, password, name });

    const users = loadUsers();
    users[email] = { name: res.user.name, onboarded: false };
    saveUsers(users);

    assign({
      user: res.user,
      token: res.token,
      onboarded: false,
      needsOnboarding: true,
    });
    save();
  }

  function completeOnboarding() {
    if (!state.value.user) return;
    assign({ onboarded: true, needsOnboarding: false });

    const email = state.value.user.email;
    const users = loadUsers();
    users[email] = { name: state.value.user.name, onboarded: true };
    saveUsers(users);

    save();
  }

  function logout() {
    assign({
      user: null,
      token: null,
      onboarded: false,
      needsOnboarding: false,
    });
    save();
  }

  function updateProfile(patch: Partial<Pick<User, "name" | "email">>) {
    if (!state.value.user) return;

    const oldEmail = state.value.user.email;
    const nextEmail = (patch.email ?? oldEmail).trim();
    const nextName = (patch.name ?? state.value.user.name)?.toString().trim();

    assign({
      user: {
        ...state.value.user,
        email: nextEmail,
        name: nextName || undefined,
      },
    });

    const users = loadUsers();
    const prev = users[oldEmail] || {
      name: state.value.user.name,
      onboarded: state.value.onboarded,
    };

    const record = {
      name: nextName || prev.name,
      onboarded: state.value.onboarded,
    };

    if (oldEmail !== nextEmail) {
      delete users[oldEmail];
    }
    users[nextEmail] = record;

    saveUsers(users);
    save();
  }

  const user = computed(() => state.value.user);
  const token = computed(() => state.value.token);
  const onboarded = computed(() => state.value.onboarded);
  const needsOnboarding = computed(() => state.value.needsOnboarding);
  const loaded = computed(() => state.value._loaded);

  return {
    // состояние
    user,
    token,
    onboarded,
    needsOnboarding,
    loaded,

    // доступ к исходному state
    state,

    // операции
    login,
    register,
    logout,
    completeOnboarding,
    updateProfile,
    loadOnce,
  } as const;
}
