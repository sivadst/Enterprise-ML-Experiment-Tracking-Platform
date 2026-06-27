import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default async function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Need to find the experiment and its project first, but API just lists runs
  // Since we don't have a GET /experiments/{id} endpoint directly (we only have list or list_for_project)
  // Let's fetch all experiments and find it
  const allExperiments = await fetcher<any[]>("/experiments", { cache: "no-store" });
  const experiment = allExperiments.find(e => e.id.toString() === id);
  
  if (!experiment) {
    return <div className="text-white">Experiment not found</div>;
  }

  const project = await fetcher<any>(`/projects/${experiment.project_id}`, { cache: "no-store" });
  const runs = await fetcher<any[]>(`/experiments/${id}/runs`, { cache: "no-store" });

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-400 mb-4">
        <Link href="/projects" className="hover:text-white">Projects</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href={`/projects/${project.id}`} className="hover:text-white">{project.name}</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-white">{experiment.name}</span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{experiment.name}</h1>
          <div className="flex gap-4 mt-2 text-sm text-slate-400">
            <span>Model: {experiment.model_type}</span>
            <span>Dataset: {experiment.dataset_version}</span>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Runs</CardTitle>
          <CardDescription className="text-slate-400">Execution history for this experiment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Run ID</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium">
                    <Link href={`/runs/${run.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm">
                      {run.name || run.id.substring(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      run.status === 'Completed' ? 'default' : 
                      run.status === 'Failed' ? 'destructive' : 'secondary'
                    } className={run.status === 'Completed' ? 'bg-green-600' : ''}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {run.duration ? `${run.duration.toFixed(1)}s` : '-'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {format(new Date(run.start_time), "MMM d, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {runs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    No runs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
