import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function ExperimentsPage() {
  const experiments = await fetcher<any[]>("/experiments", { cache: "no-store" });
  const projects = await fetcher<any[]>("/projects", { cache: "no-store" });
  const projectMap = new Map(projects.map(p => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Experiments</h1>
          <p className="text-slate-400">All experiments across projects.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Project</TableHead>
                <TableHead className="text-slate-400">Model Type</TableHead>
                <TableHead className="text-slate-400">Dataset</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((exp) => (
                <TableRow key={exp.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium">
                    <Link href={`/experiments/${exp.id}`} className="text-blue-400 hover:text-blue-300">
                      {exp.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <Link href={`/projects/${exp.project_id}`} className="hover:text-blue-400">
                      {projectMap.get(exp.project_id) || "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-300">{exp.model_type}</TableCell>
                  <TableCell className="text-slate-300">{exp.dataset_version}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
