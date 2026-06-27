import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function ModelRegistryPage() {
  const models = await fetcher<any[]>("/models", { cache: "no-store" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Model Registry</h1>
          <p className="text-slate-400">Centrally manage ML models, versions, and stages.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Version</TableHead>
                <TableHead className="text-slate-400">Stage</TableHead>
                <TableHead className="text-slate-400">Created</TableHead>
                <TableHead className="text-slate-400">Run ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{model.name}</TableCell>
                  <TableCell className="text-slate-300 font-mono">{model.version}</TableCell>
                  <TableCell>
                    <Badge variant={
                      model.stage === 'Production' ? 'default' :
                      model.stage === 'Staging' ? 'secondary' : 'outline'
                    } className={model.stage === 'Production' ? 'bg-green-600' : model.stage === 'Staging' ? 'bg-yellow-600' : 'text-slate-300'}>
                      {model.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {format(new Date(model.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {model.run_id ? (
                      <Link href={`/runs/${model.run_id}`} className="text-blue-400 hover:underline font-mono text-sm">
                        {model.run_id.substring(0, 8)}
                      </Link>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {models.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">No models registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
