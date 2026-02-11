import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Mail, Phone, RefreshCw, User } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { ProfileSkeleton } from '@/components/Skeleton';
import { RenewMembershipModal } from '@/components/RenewMembershipModal';
import { Button } from '@/components/ui/button';
import { membersService } from '@/services/members.service';
import { packagesService } from '@/services/packages.service';
import { Member, Package } from '@/types';
import { format } from 'date-fns';

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renewModalOpen, setRenewModalOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const [memberData, packagesData] = await Promise.all([
        membersService.getMember(id),
        packagesService.getPackages(),
      ]);
      setMember(memberData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      navigate('/members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Member not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/members')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Members
      </Button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{member.firstName} {member.lastName}</h1>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-muted-foreground">{member.memberId}</p>
          </div>
        </div>
        <Button onClick={() => setRenewModalOpen(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Renew Membership
        </Button>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Personal Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{member.firstName} {member.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{member.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Membership Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-medium">{member.package?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                <p className="font-medium">{member.enrollmentDate ? format(new Date(member.enrollmentDate), 'MMMM d, yyyy') : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className={`font-medium ${member.status === 'expired' ? 'text-destructive' : member.status === 'expiring' ? 'text-warning' : ''}`}>
                  {member.expiryDate ? format(new Date(member.expiryDate), 'MMMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AxTraxNG Sync Status */}
        {member.axtraxSyncStatus && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 font-semibold">AxTraxNG Integration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sync Status</span>
                <StatusBadge 
                  status={member.axtraxSyncStatus === 'synced' ? 'active' : member.axtraxSyncStatus === 'pending' ? 'expiring' : 'expired'} 
                />
              </div>
              {member.axtraxId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">AxTrax ID</span>
                  <span className="font-mono text-sm">{member.axtraxId}</span>
                </div>
              )}
              {member.axtraxLastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Synced</span>
                  <span className="text-sm">{member.axtraxLastSync ? format(new Date(member.axtraxLastSync), 'MMM d, yyyy HH:mm') : 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Payment */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Last Payment</h2>
          {member.lastPayment ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">KES {member.lastPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{member.lastPayment.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{member.lastPayment?.createdAt ? format(new Date(member.lastPayment.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No payment history</p>
          )}
        </div>
      </div>

      {/* Renew Modal */}
      <RenewMembershipModal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        member={member}
        packages={packages}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
}
