import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useHealthCheck } from "../utils/api-client";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "My App" }, { name: "description", content: "My App" }];
}

export default function Home() {
  const navigate = useNavigate();
  const { data: health, isLoading, error } = useHealthCheck();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Checking...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600">Offline</span>
              </div>
            )}
            {health && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
                <span className="text-xs text-muted-foreground">
                  ({health.status} - {new Date(health.timestamp).toLocaleTimeString()})
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Migration Complete!</h2>
          <p className="text-sm text-muted-foreground">
            Successfully migrated from tRPC to standard HTTP APIs.
            Redirecting to dashboard...
          </p>
        </section>
      </div>
    </div>
  );
}
