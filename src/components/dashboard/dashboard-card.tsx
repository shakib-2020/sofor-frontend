import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  href: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
}

interface DashboardCardProps {
  title: string;
  count?: number | string;
  icon: LucideIcon;
  actions?: Action[];
}

export function DashboardCard({ title, count, icon: Icon, actions }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count !== undefined ? count : '-'}</div>
        {actions && actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button key={index} asChild variant={action.variant || 'outline'} size="sm">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
