import { useEffect, useState } from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { paymentsService } from '@/services/payments.service';
import { Payment, PaginatedResponse } from '@/types';
import { format } from 'date-fns';

export default function Payments() {
  const [payments, setPayments] = useState<PaginatedResponse<Payment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await paymentsService.getPayments({
        status: statusFilter as 'pending' | 'completed' | 'failed' | 'all',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 10,
      });
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, startDate, endDate, page]);

  const getMethodBadge = (method: Payment['method']) => {
    const colors: Record<Payment['method'], string> = {
      mpesa: 'bg-success/10 text-success',
      cash: 'bg-muted text-foreground',
      card: 'bg-primary/10 text-primary',
      bank: 'bg-accent/10 text-accent',
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase ${colors[method]}`}>
        {method}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-description">View and manage payment transactions</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px]"
            placeholder="Start date"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
            placeholder="End date"
          />
        </div>

        <div className="ml-auto">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={10} columns={6} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.data.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.createdAt ? format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm') : 'N/A'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.member?.firstName} {payment.member?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{payment.member?.memberId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.package?.name || 'N/A'}</TableCell>
                  <TableCell className="font-medium">KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.mpesaReference || '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                </TableRow>
              ))}
              {payments?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {payments && payments.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={payments.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
