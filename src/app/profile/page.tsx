'use client';

import React, { useState } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut,
  Settings,
  CreditCard,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const { user, isLoading, error } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/sign-in';
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading profile</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userData = user || session?.user;
  const sessionData = session?.session;

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No user data found</p>
              <Button onClick={() => window.location.href = '/sign-in'}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userData.image || ''} alt={userData.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(userData.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{userData.name}</CardTitle>
                    <CardDescription className="text-lg">{userData.email}</CardDescription>
                    {userData.role && (
                      <div className="mt-2">
                        <Badge 
                          variant={userData.role === 'admin' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {userData.role}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Separator />
                
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{userData.email}</span>
                        {userData.emailVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Member Since</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {userData.createdAt ? 
                            format(new Date(userData.createdAt), 'MMM dd, yyyy') : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>

                    {userData.role && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm capitalize">{userData.role}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Account Status</label>
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${userData.banned ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-sm">
                          {userData.banned ? 'Restricted' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Information */}
                {sessionData && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Current Session</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-500">Session Expires</label>
                          <span className="text-sm">
                            {format(new Date(sessionData.expiresAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        {sessionData.ipAddress && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">IP Address</label>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{sessionData.ipAddress}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {/* TODO: Navigate to settings */}}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/my-bookings'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>

                <Separator />

                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Bookings</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Age</span>
                    <span className="font-semibold">
                      {userData.createdAt ? 
                        `${Math.floor((new Date().getTime() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                        '-'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email Status</span>
                    <Badge variant={userData.emailVerified ? 'default' : 'secondary'}>
                      {userData.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
