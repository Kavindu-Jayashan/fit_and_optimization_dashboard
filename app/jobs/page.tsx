"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";

type Job = {
  rowKey: string;
  title: string;
  description: string;
  requirements: string | null | undefined;
  company: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs");
        const data = await res.json();
        console.log("job data: ", data);

        if (!res.ok) {
          setErr(data.error);
          return;
        }

        setJobs(data);
      } catch (err: any) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (err) return <p>{err}</p>;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*72)",
          "--header-height": "calc(var(--spacing)*12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <div className="p-3 bg-[#141416]/8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card key={job.rowKey} className=" h-50 w-100">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{job.description}</p>
                  <p>
                    {(job.requirements ?? "").split(",").map((req) => (
                      <span key={req}>{req.trim()}</span>
                    ))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
