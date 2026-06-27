import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetcher<any>(`/projects/${id}`, { cache: "no-store" });
  const experiments = await fetcher<any[]>(`/projects/${id}/experiments`, { cache: "no-store" });

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-400 mb-4">
        <Link href="/projects" className="hover:text-white">Projects</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-white">{project.name}</span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
          <p className="text-slate-400 mt-2 max-w-3xl">{project.description}</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Experiments</CardTitle>
          <CardDescription className="text-slate-400">All experiments in this project</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Model Type</TableHead>
                <TableHead className="text-slate-400">Dataset</TableHead>
                <TableHead className="text-slate-400">Tags</TableHead>
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
                  <TableCell className="text-slate-300">{exp.model_type}</TableCell>
                  <TableCell className="text-slate-300">{exp.dataset_version}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {exp.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-slate-300 border-slate-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {experiments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    No experiments found in this project.
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
