import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>("/health");
  }

  // Private data (for testing auth)
  async getPrivateData() {
    return this.request<{ message: string; user: any }>("/private");
  }

  // User endpoints
  user = {
    getProfile: () => this.request<any>("/api/users/profile"),

    updateProfile: (data: { name?: string; image?: string }) =>
      this.request<any>("/api/users/profile", {
        method: "PUT",
        body: data,
      }),

    getOnboardingStatus: () =>
      this.request<{ completed: boolean }>("/api/users/onboarding/status"),
  };

  // Organization endpoints
  organization = {
    create: (data: {
      name: string;
      slug: string;
      description?: string;
      website?: string;
    }) =>
      this.request<any>("/api/organizations", {
        method: "POST",
        body: data,
      }),

    getUserOrganizations: () => this.request<any[]>("/api/organizations"),

    getById: (organizationId: string) =>
      this.request<any>(`/api/organizations/${organizationId}`),

    update: (
      organizationId: string,
      data: {
        name?: string;
        description?: string;
        website?: string;
      }
    ) =>
      this.request<any>(`/api/organizations/${organizationId}`, {
        method: "PUT",
        body: data,
      }),

    checkSlugAvailability: (slug: string) =>
      this.request<{ available: boolean }>(
        `/api/organizations/slug/check?slug=${encodeURIComponent(slug)}`
      ),

    generateSlug: (name: string) =>
      this.request<{ slug: string }>("/api/organizations/slug/generate", {
        method: "POST",
        body: { name },
      }),
  };
}

export const apiClient = new ApiClient();

// React Query helper hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.healthCheck(),
  });
};

export const usePrivateData = () => {
  return useQuery({
    queryKey: ["private"],
    queryFn: () => apiClient.getPrivateData(),
  });
};

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => apiClient.user.getProfile(),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; image?: string }) =>
      apiClient.user.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
};

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ["user", "onboarding"],
    queryFn: () => apiClient.user.getOnboardingStatus(),
  });
};

// Organization hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      slug: string;
      description?: string;
      website?: string;
    }) => apiClient.organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};

export const useUserOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiClient.organization.getUserOrganizations(),
  });
};

export const useOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => apiClient.organization.getById(organizationId),
    enabled: !!organizationId,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: { name?: string; description?: string; website?: string };
    }) => apiClient.organization.update(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organization", variables.organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
};

export const useCheckSlugAvailability = (slug: string) => {
  return useQuery({
    queryKey: ["organization", "slug", slug],
    queryFn: () => apiClient.organization.checkSlugAvailability(slug),
    enabled: !!slug && slug.length > 0,
  });
};

export const useGenerateSlug = () => {
  return useMutation({
    mutationFn: (name: string) => apiClient.organization.generateSlug(name),
  });
};
