"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  useEffect(() => {
    // We need all runs to display here. 
    // Since we only have /experiments/{id}/runs, we first get experiments, then get runs.
    const loadRuns = async () => {
      const exps = await fetcher<any[]>("/experiments");
      let allRuns: any[] = [];
      for (const exp of exps) {
        const r = await fetcher<any[]>(`/experiments/${exp.id}/runs`);
        allRuns = [...allRuns, ...r];
      }
      setRuns(allRuns);
    };
    loadRuns();
  }, []);

  const toggleRun = (id: string) => {
    if (selectedRuns.includes(id)) {
      setSelectedRuns(selectedRuns.filter(r => r !== id));
    } else {
      if (selectedRuns.length < 3) {
        setSelectedRuns([...selectedRuns, id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">All Runs</h1>
          <p className="text-slate-400">Select up to 3 runs to compare.</p>
        </div>
        {selectedRuns.length > 1 && (
          <Button onClick={() => window.location.href = `/runs/compare?ids=${selectedRuns.join(",")}`}>
            Compare {selectedRuns.length} Runs
          </Button>
        )}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="w-12 text-slate-400">Compare</TableHead>
                <TableHead className="text-slate-400">Run ID</TableHead>
                <TableHead className="text-slate-400">Model</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedRuns.includes(run.id)}
                      onChange={() => toggleRun(run.id)}
                      disabled={!selectedRuns.includes(run.id) && selectedRuns.length >= 3}
                      className="rounded border-slate-700 bg-slate-800"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <a href={`/runs/${run.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm">
                      {run.name || run.id.substring(0, 8)}
                    </a>
                  </TableCell>
                  <TableCell className="text-slate-300">{run.model_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={run.status === 'Completed' ? 'default' : 'secondary'} className={run.status === 'Completed' ? 'bg-green-600' : ''}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{run.duration ? `${run.duration.toFixed(1)}s` : '-'}</TableCell>
                </TableRow>
              ))}
              {runs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500">Loading runs...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
