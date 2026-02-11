import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { CardSkeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardStats } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your membership management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : stats && (
          <>
            <StatCard
              title="Total Members"
              value={stats.totalMembers}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Active Members"
              value={stats.activeMembers}
              description={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% of total`}
              icon={UserCheck}
            />
            <StatCard
              title="Expired"
              value={stats.expiredMembers}
              description="Needs attention"
              icon={UserX}
            />
            <StatCard
              title="Expiring Soon"
              value={stats.expiringMembers}
              description="Within 7 days"
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Revenue & Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Revenue</h2>
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : stats && (
            <>
              <StatCard
                title="Total Revenue"
                value={`KES ${stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                className="bg-gradient-to-br from-card to-muted/30"
              />
              <StatCard
                title="This Month"
                value={`KES ${stats.monthlyRevenue.toLocaleString()}`}
                icon={TrendingUp}
                trend={{ value: 8, isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Recent Renewals */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Renewals</h2>
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="divide-y">
                {stats.recentRenewals.map((renewal) => (
                  <div
                    key={renewal.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                        {renewal.member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{renewal.member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {renewal.package.name} • {renewal.date ? formatDistanceToNow(new Date(renewal.date), { addSuffix: true }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">
                        +KES {renewal.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {stats ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Retention Rate</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-2xl font-bold">
            {stats ? stats.recentRenewals.length : 0}
          </p>
          <p className="text-sm text-muted-foreground">Renewals Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">
            {stats?.expiringMembers || 0}
          </p>
          <p className="text-sm text-muted-foreground">Expiring This Week</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
