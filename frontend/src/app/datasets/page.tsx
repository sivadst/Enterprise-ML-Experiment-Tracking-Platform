import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function DatasetRegistryPage() {
  const datasets = await fetcher<any[]>("/datasets", { cache: "no-store" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dataset Registry</h1>
          <p className="text-slate-400">Manage training and evaluation datasets.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Version</TableHead>
                <TableHead className="text-slate-400">Rows</TableHead>
                <TableHead className="text-slate-400">Tags</TableHead>
                <TableHead className="text-slate-400">Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((ds) => (
                <TableRow key={ds.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{ds.name}</TableCell>
                  <TableCell className="text-slate-300 font-mono">{ds.version}</TableCell>
                  <TableCell className="text-slate-300">{ds.row_count ? ds.row_count.toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {ds.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-slate-300 border-slate-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {format(new Date(ds.upload_date), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
              {datasets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">No datasets registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
