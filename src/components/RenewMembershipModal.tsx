import { useState } from 'react';
import { X, Loader2, CheckCircle, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Package, Member } from '@/types';
import { membersService } from '@/services/members.service';

interface RenewMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  packages: Package[];
  onSuccess: () => void;
}

type ModalState = 'form' | 'loading' | 'success';

export function RenewMembershipModal({
  isOpen,
  onClose,
  member,
  packages,
  onSuccess,
}: RenewMembershipModalProps) {
  const [state, setState] = useState<ModalState>('form');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [mpesaPhone, setMpesaPhone] = useState(member.phone || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      toast({
        title: 'Error',
        description: 'Please select a package',
        variant: 'destructive',
      });
      return;
    }

    if (!mpesaPhone || mpesaPhone.length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid MPESA phone number',
        variant: 'destructive',
      });
      return;
    }

    setState('loading');

    try {
      await membersService.renewMembership({
        memberId: member.id,
        packageId: selectedPackage,
        mpesaPhone,
      });

      setState('success');
      
      // Auto close after success
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setState('form');
      toast({
        title: 'Error',
        description: 'Failed to initiate renewal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setState('form');
    setSelectedPackage('');
    onClose();
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state === 'success' ? 'Payment Initiated' : 'Renew Membership'}
          </DialogTitle>
        </DialogHeader>

        {state === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Renewing for</p>
              <p className="font-medium">{member.firstName} {member.lastName}</p>
              <p className="text-sm text-muted-foreground">{member.memberId}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package">Select Package</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.filter(p => p.isActive).map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{pkg.name}</span>
                        <span className="text-muted-foreground">
                          KES {pkg.price.toLocaleString()} / {pkg.duration} days
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">MPESA Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="+254..."
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                An STK push will be sent to this number
              </p>
            </div>

            {selectedPkg && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-semibold">
                    KES {selectedPkg.price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Send STK Push
              </Button>
            </div>
          </form>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-center font-medium">Sending STK Push...</p>
            <p className="text-center text-sm text-muted-foreground">
              Please check your phone and enter your MPESA PIN
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-success/20 p-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <p className="mt-4 text-center font-medium">Payment Request Sent!</p>
            <p className="text-center text-sm text-muted-foreground">
              Waiting for payment confirmation...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
