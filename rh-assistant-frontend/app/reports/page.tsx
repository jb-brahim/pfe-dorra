'use client';

import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">View detailed analytics about your recruitment process.</p>
      </div>
      
      <Card className="mt-6 p-12 border-border flex flex-col items-center justify-center gap-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">No reports available yet</p>
        <p className="text-muted-foreground text-center">Reports will appear once you start recruiting</p>
      </Card>
    </div>
  );
}
