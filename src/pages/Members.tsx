import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { TableSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { membersService } from '@/services/members.service';
import { Member, PaginatedResponse } from '@/types';
import { format } from 'date-fns';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<PaginatedResponse<Member> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await membersService.getMembers({
        search,
        status: statusFilter as 'active' | 'expired' | 'expiring' | 'all',
        page,
        limit: 10,
      });
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, statusFilter, page]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Members</h1>
        <p className="page-description">Manage all your members</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, ID, or phone..."
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={fetchMembers}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.data.map((member) => (
                <TableRow 
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <TableCell className="font-mono text-sm">{member.memberId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                      <span>{member.firstName} {member.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.package?.name || 'N/A'}</TableCell>
                  <TableCell>{member.expiryDate ? format(new Date(member.expiryDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                  <TableCell>
                    <StatusBadge status={member.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/members/${member.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {members?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {members && members.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={members.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
