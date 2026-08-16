import type { Metadata } from "next";
import JobPosterStudio from "@/components/job-poster/JobPosterStudio";

export const metadata: Metadata = {
  title: "AI Job Poster Generator | HR Suite",
  description:
    "Paste a job description and export a professional 1080×1350 recruitment poster — AI extracts the title, deadline, responsibilities and requirements automatically.",
};

export default function JobPosterPage() {
  return <JobPosterStudio />;
}
