"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

type Job = {
  rowKey: string;
  title: string;
  description: string;
  requirements: string | null | undefined;
  company:string;
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
        console.log("job data: ",data);

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
  },[]);


  if(loading) return <p>Loading...</p>;
  if(err) return <p>{err}</p>

  return (
    <div>
      <div>
        {jobs.map((job) => (
          <Card key={job.rowKey}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{job.description}</p>
              <p>{(job.requirements ?? "").split(",").map((req) =>  (
                <span key={req}>
                    {req.trim()}
                </span>
              ))}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
