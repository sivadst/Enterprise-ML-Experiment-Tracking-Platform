import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import PlotlyChart from "@/components/charts/plotly-chart";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // We need the run, but we don't have a direct GET /runs/{id} endpoint
  // We can fetch experiments -> runs, or maybe we just add it? 
  // Let's add the endpoint quickly or just fetch all experiments and then all runs?
  // Let's fetch the run metrics, parameters, and artifacts first.
  const metrics = await fetcher<any[]>(`/runs/${id}/metrics`, { cache: "no-store" });
  const parameters = await fetcher<any[]>(`/runs/${id}/parameters`, { cache: "no-store" });
  const artifacts = await fetcher<any[]>(`/runs/${id}/artifacts`, { cache: "no-store" });
  const reviews = await fetcher<any[]>(`/runs/${id}/review`, { cache: "no-store" }).catch(() => []); // fetch existing reviews

  // We group metrics by name for charting
  const metricNames = Array.from(new Set(metrics.map(m => m.name)));
  
  const metricCharts = metricNames.map(name => {
    const data = metrics.filter(m => m.name === name).sort((a, b) => a.step - b.step);
    return {
      name,
      x: data.map(m => m.step),
      y: data.map(m => m.value)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono">Run: {id.substring(0, 8)}...</h1>
          <p className="text-slate-400 mt-2">View parameters, metrics, artifacts, and AI insights.</p>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="reviews">AI Review</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {metricCharts.map((chart) => (
              <Card key={chart.name} className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{chart.name}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <PlotlyChart 
                    data={[
                      {
                        x: chart.x,
                        y: chart.y,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: '#3b82f6' },
                        name: chart.name
                      }
                    ]}
                    layout={{ margin: { t: 10, r: 10, l: 40, b: 40 } }}
                  />
                </CardContent>
              </Card>
            ))}
            {metricCharts.length === 0 && (
              <div className="text-slate-500 col-span-2">No metrics recorded for this run.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((param) => (
                    <TableRow key={param.id} className="border-slate-800">
                      <TableCell className="font-medium text-slate-300">{param.name}</TableCell>
                      <TableCell className="text-white font-mono">{param.value}</TableCell>
                    </TableRow>
                  ))}
                  {parameters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-6 text-slate-500">No parameters recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Filename</TableHead>
                    <TableHead className="text-slate-400">Size</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artifacts.map((artifact) => (
                    <TableRow key={artifact.id} className="border-slate-800">
                      <TableCell className="font-medium text-blue-400 hover:underline cursor-pointer">
                        {artifact.filename}
                      </TableCell>
                      <TableCell className="text-slate-300">{(artifact.size / 1024).toFixed(2)} KB</TableCell>
                      <TableCell className="text-slate-300">{artifact.mime_type || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-300">{artifact.version}</TableCell>
                    </TableRow>
                  ))}
                  {artifacts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">No artifacts uploaded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className={`bg-slate-900 border-l-4 ${
                review.severity === 'Error' ? 'border-l-red-500' :
                review.severity === 'Warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg text-white">{review.summary}</CardTitle>
                    <Badge variant="outline" className="text-slate-300">Confidence: {(review.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong className="text-slate-300">Evidence:</strong> <span className="text-slate-400">{review.evidence}</span></div>
                  <div><strong className="text-slate-300">Action:</strong> <span className="text-slate-400">{review.suggested_action}</span></div>
                </CardContent>
              </Card>
            ))}
            {reviews.length === 0 && (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center text-slate-500">
                  No AI reviews generated for this run yet.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
