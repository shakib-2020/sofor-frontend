'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { client } from '@/lib/auth-client';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { CounterOwnerOrAboveRoute } from '@/components/auth/route-guards';

type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  counterId?: number | null;
  counterName?: string | null;
  banned?: boolean;
};

export default function StaffManagementPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  // Normalize roles to match backend
  const currentRole = (currentUser?.role || 'customer');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
    counterId: undefined as number | undefined,
  });
  
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: '',
    reason: '',
    expirationDate: undefined as Date | undefined,
  });

  // Query staff/users
  const { data: staffList, isLoading: isStaffLoading } = useQuery<StaffUser[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await apiClient.get('/api/user/staff');
      return res.data || [];
    },
  });

  // Query counters (for assignment dropdown)
  const { data: countersList } = useQuery<any[]>({
    queryKey: ['counters-list'],
    queryFn: async () => {
      const res = await apiClient.get('/api/counter');
      return res.data || [];
    },
    enabled: ['superAdmin', 'admin', 'operatorAdmin', 'operatorManager'].includes(currentRole),
  });

  const isSystemAdmin = currentRole === 'superAdmin' || currentRole === 'admin';

  // Get allowed roles for user creation based on current user role
  const getAllowedRoles = () => {
    if (isSystemAdmin) {
      return [
        { value: 'superAdmin', label: 'Super Admin' },
        { value: 'operatorAdmin', label: 'Operator Admin' },
        { value: 'customer', label: 'Customer' },
      ];
    }
    if (currentRole === 'operatorAdmin' || currentRole === 'operatorManager') {
      return [
        { value: 'operatorManager', label: 'Operator Manager' },
        { value: 'operatorStaff', label: 'Operator Staff' },
        { value: 'counterOwner', label: 'Counter Owner' },
        { value: 'counterStaff', label: 'Counter Staff' },
      ];
    }
    if (currentRole === 'counterOwner') {
      return [
        { value: 'counterStaff', label: 'Counter Staff' },
      ];
    }
    return [];
  };

  const allowedRoles = getAllowedRoles();

  // Handle setting default role when dialog opens
  const handleOpenDialog = () => {
    if (allowedRoles.length > 0) {
      setNewUser({
        email: '',
        password: '',
        name: '',
        role: allowedRoles[0].value,
        counterId: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('create');
    try {
      await apiClient.post('/api/user/staff', {
        email: newUser.email,
        password: newUser.password || undefined,
        name: newUser.name,
        role: newUser.role,
        counterId: newUser.counterId,
      });
      
      toast.success('Staff/User created successfully');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    setIsLoading(`delete-${id}`);
    try {
      await apiClient.delete(`/api/user/staff/${id}`);
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await (client as any).admin.revokeUserSessions({ userId: id });
      toast.success('Sessions revoked successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke sessions');
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      await (client as any).admin.impersonateUser({ userId: id });
      toast.success('Impersonated user successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to impersonate user');
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error('Expiration date is required');
      }
      await (client as any).admin.banUser({
        userId: banForm.userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - Date.now(),
      });
      toast.success('User banned successfully');
      setIsBanDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleUnbanUser = async (id: string) => {
    setIsLoading(`ban-${id}`);
    try {
      await (client as any).admin.unbanUser({ userId: id });
      toast.success('User unbanned successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
    } finally {
      setIsLoading(undefined);
    }
  };

  const getRoleBadgeColor = (roleStr: string) => {
    switch (roleStr) {
      case 'superAdmin':
      case 'admin':
        return 'destructive';
      case 'operatorAdmin':
        return 'default';
      case 'operatorManager':
      case 'operatorStaff':
        return 'secondary';
      case 'counterOwner':
      case 'counterStaff':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <CounterOwnerOrAboveRoute>
      <div className="container mx-auto space-y-8 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isSystemAdmin ? 'System User Management' : 'Staff Management'}
          </CardTitle>
          {allowedRoles.length > 0 && (
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" /> Create Staff / User
            </Button>
          )}
          
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Staff / User Account</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateUser}>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                    value={newUser.name}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                    type="email"
                    value={newUser.email}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Defaults to Sofor@1234 if empty"
                    type="password"
                    value={newUser.password}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value, counterId: undefined })
                    }
                    value={newUser.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedRoles.map((roleOpt) => (
                        <SelectItem key={roleOpt.value} value={roleOpt.value}>
                          {roleOpt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Counter selection conditional on role */}
                {['counterOwner', 'counterStaff'].includes(newUser.role) && (
                  <div>
                    <Label htmlFor="counterId">Assigned Ticket Counter</Label>
                    <Select
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, counterId: Number(value) })
                      }
                      value={newUser.counterId ? String(newUser.counterId) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a ticket counter" />
                      </SelectTrigger>
                      <SelectContent>
                        {countersList?.map((counter) => (
                          <SelectItem key={counter.id} value={String(counter.id)}>
                            {counter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={isLoading === 'create'}
                  type="submit"
                >
                  {isLoading === 'create' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={setIsBanDialogOpen} open={isBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleBanUser}>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                    value={banForm.reason}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !banForm.expirationDate && 'text-muted-foreground'
                        )}
                        id="expirationDate"
                        variant={'outline'}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        initialFocus
                        mode="single"
                        onSelect={(date) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        selected={banForm.expirationDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                  type="submit"
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    'Ban User'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isStaffLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Counter Scope</TableHead>
                  {isSystemAdmin && <TableHead>Status</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList?.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-semibold">{staffMember.email}</TableCell>
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(staffMember.role)}>
                        {staffMember.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.counterName ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {staffMember.counterName}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Global / None</span>
                      )}
                    </TableCell>
                    {isSystemAdmin && (
                      <TableCell>
                        {staffMember.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* Allowed Actions based on Role */}
                        <Button
                          disabled={isLoading?.startsWith('delete')}
                          onClick={() => handleDeleteUser(staffMember.id)}
                          size="sm"
                          variant="destructive"
                        >
                          {isLoading === `delete-${staffMember.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>

                        {/* System Admin ONLY actions */}
                        {isSystemAdmin && (
                          <>
                            <Button
                              disabled={isLoading?.startsWith('revoke')}
                              onClick={() => handleRevokeSessions(staffMember.id)}
                              size="sm"
                              variant="outline"
                              title="Revoke Sessions"
                            >
                              {isLoading === `revoke-${staffMember.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              disabled={isLoading?.startsWith('impersonate')}
                              onClick={() => handleImpersonateUser(staffMember.id)}
                              size="sm"
                              variant="secondary"
                              title="Impersonate"
                            >
                              {isLoading === `impersonate-${staffMember.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              disabled={isLoading?.startsWith('ban')}
                              onClick={async () => {
                                if (staffMember.banned) {
                                  handleUnbanUser(staffMember.id);
                                } else {
                                  setBanForm({
                                    userId: staffMember.id,
                                    reason: '',
                                    expirationDate: undefined,
                                  });
                                  setIsBanDialogOpen(true);
                                }
                              }}
                              size="sm"
                              variant="outline"
                            >
                              {isLoading === `ban-${staffMember.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : staffMember.banned ? (
                                'Unban'
                              ) : (
                                'Ban'
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!staffList || staffList.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={isSystemAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                      No accounts found. Click "Create Staff / User" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </CounterOwnerOrAboveRoute>
  );
}
