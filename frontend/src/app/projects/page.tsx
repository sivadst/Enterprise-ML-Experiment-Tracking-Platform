import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const projects = await fetcher<any[]>("/projects", { cache: "no-store" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-slate-400">Manage your machine learning projects.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="hover:border-blue-500/50 transition-colors h-full flex flex-col bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-white">{project.name}</CardTitle>
                  <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 line-clamp-2">
                  {project.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{project.owner}</span>
                  <span>{format(new Date(project.creation_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {project.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-slate-300 border-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
