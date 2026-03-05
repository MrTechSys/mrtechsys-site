// cloudflip/src/api/apiClient.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/cloudflip";

class APIClient {
  constructor() {
    this.auth = {
      me: async () => this.request("/auth/me"),
      login: async (email, password) => this.request("/auth/login", "POST", { email, password }),
      register: async (data) => this.request("/auth/register", "POST", data),
      logout: async (token) => this.request("/auth/logout", "POST", { token }),
      refresh: async (token) => this.request("/auth/refresh", "POST", { token }),
    };

    this.entities = new Proxy({}, {
      get: (target, entityName) => {
        return {
          list: (params) => this.request(`/${entityName}${this.buildQuery(params)}`),
          get: (id) => this.request(`/${entityName}/${id}`),
          create: (data) => this.request(`/${entityName}`, "POST", data),
          update: (id, data) => this.request(`/${entityName}/${id}`, "PUT", data),
          delete: (id) => this.request(`/${entityName}/${id}`, "DELETE"),
          filter: (query) => this.request(`/${entityName}?${new URLSearchParams(query)}`),
        };
      }
    });

    this.functions = {
      invoke: async (name, payload) => this.request(`/functions/${name}`, "POST", payload),
    };

    this.integrations = {
      Core: {
        UploadFile: async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          return this.request("/integrations/upload", "POST", formData, true);
        },
        InvokeLLM: async (payload) => this.request("/integrations/llm", "POST", payload),
      }
    };
  }

  buildQuery(params) {
    if (!params) return "";
    const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
    if (Object.keys(filteredParams).length === 0) return "";
    return "?" + new URLSearchParams(filteredParams).toString();
  }

  async request(path, method = "GET", body = null, isFormData = false) {
    const options = {
      method,
      headers: {},
    };

    if (body) {
      if (isFormData) {
        options.body = body;
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: "Unknown error" };
      }
      throw new Error(errorData.error || "Request failed");
    }
    return response.json();
  }
}

export const api = new APIClient();
