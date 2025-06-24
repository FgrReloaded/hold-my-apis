import { useEffect } from "react";
import type { Route } from "./+types/_index";
import { useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "My App" }, { name: "description", content: "My App" }];
}

export default function Home() {

  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [])

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">

          </div>
        </section>
      </div>
    </div>
  );
}
