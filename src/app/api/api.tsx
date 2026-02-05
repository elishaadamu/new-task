export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  ENDPOINTS: {
    AUTH: {
      ADMIN_REGISTER: "admin/users",
      USER_REGISTER: "admin/users",
      ADMIN_LOGIN: "auth/login",
    },
    USER_ACTIONS: {
      GET_USERS: "admin/users",
      UPDATE_USER: "admin/users/", //APPEND {userId}
      DELETE_USER: "admin/users/", //APPEND {userId}
      SUSPEND_USER: "admin/users/", //APPEND {userId}/suspend
    },
    TASK: {
      CREATE: "tasks",
      GET: "admin/tasks",
      DELETE: "admin/tasks/", //APPEND {taskId}
      UPDATE: "admin/tasks/", //APPEND {taskId}/status
      COMMENT: "admin/tasks/", //APPEND {taskId}/comment
    },
    PROFILE: {
      GET: "auth/profile",
      UPDATE: "admin/users/", //APPEND {userId}
    },
    WALLET: {
      CREDIT: "admin/wallet/credit",
      DEBIT: "admin/wallet/debit",
      GET_ALL_WALLETS: "admin/wallet/all",
      GET_TRANSACTIONS: "admin/wallet/", //APPEND {userId}/transactions
      GET_BALANCE: "admin/wallet/", //APPEND {userId}/balance
    },
    STATISTICS: {
      GET: "admin/stats",
      GET_MONTHLY: "admin/stats/monthly-tasks",
    },
  },
};

export const apiUrl = (endpoint: string) => {
  const base = API_CONFIG.BASE_URL.endsWith("/")
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};
