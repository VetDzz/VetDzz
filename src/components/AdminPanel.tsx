import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  Shield, 
  AlertTriangle, 
  Eye,
  UserX,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: {
    type?: string;
    full_name?: string;
  };
  banned_until?: string;
  is_banned?: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  user_id: string;
}

interface LabProfile {
  id: string;
  lab_name: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  is_verified: boolean;
  user_id: string;
}

const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const { checkBanStatus } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clientProfiles, setClientProfiles] = useState<UserProfile[]>([]);
  const [labProfiles, setLabProfiles] = useState<LabProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    fetchBannedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      const { data } = await supabase
        .from('banned_users')
        .select('user_id, banned_until, reason')
        .gt('banned_until', new Date().toISOString());

      console.log('📋 Banned users data:', data);
      setBannedUsers(data?.map(ban => ban.user_id) || []);
    } catch (error) {
      console.warn('Could not fetch banned users (table might not exist yet):', error);
      setBannedUsers([]);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from auth.users...');

      // Create a function to get auth users (admin only)
      const { data: authUsers, error } = await supabase.rpc('get_auth_users_admin');

      if (error) {
        console.warn('Could not fetch from auth.users, falling back to profiles:', error);
        // Fallback to profiles method
        await fetchUsersFromProfiles();
        return;
      }

      console.log('✅ Got auth users:', authUsers);

      // Filter out admin users and format
      const filteredUsers = authUsers
        .filter((user: any) => user.email !== 'glowyboy01@gmail.com')
        .map((user: any) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          user_metadata: user.user_metadata || {}
        }));

      setUsers(filteredUsers);
      console.log(`📊 Loaded ${filteredUsers.length} users from auth.users`);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to profiles method
      await fetchUsersFromProfiles();
    }
  };

  const fetchUsersFromProfiles = async () => {
    try {
      console.log('📋 Fallback: Fetching users from profiles...');

      // Fetch users from profiles since we can't access auth.users directly
      const [clientsResult, labsResult] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('laboratory_profiles').select('*')
      ]);

      // Combine and format user data
      const allUsers: User[] = [];

      if (clientsResult.data) {
        clientsResult.data.forEach(profile => {
          allUsers.push({
            id: profile.user_id,
            email: profile.email || 'Email non disponible',
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            user_metadata: {
              type: 'client',
              full_name: profile.full_name
            }
          });
        });
      }

      if (labsResult.data) {
        labsResult.data.forEach(profile => {
          allUsers.push({
            id: profile.user_id,
            email: profile.email,
            created_at: profile.created_at,
            last_sign_in_at: profile.created_at,
            user_metadata: {
              type: 'laboratory',
              full_name: profile.lab_name
            }
          });
        });
      }

      setUsers(allUsers);
      console.log(`📊 Loaded ${allUsers.length} users from profiles`);
    } catch (error) {
      console.error('Error fetching users from profiles:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des utilisateurs",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const [clientsResult, labsResult] = await Promise.all([
        supabase.from('client_profiles').select('*'),
        supabase.from('laboratory_profiles').select('*')
      ]);

      if (clientsResult.data) setClientProfiles(clientsResult.data);
      if (labsResult.data) setLabProfiles(labsResult.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des profils",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string, duration: number = 30) => {
    try {
      console.log(`🚫 Banning user ${userId} for ${duration} days...`);

      // Try the database function first
      const { data, error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_duration_days: duration,
        ban_reason: `Banni pour ${duration} jours par admin`,
        admin_email: 'glowyboy01@gmail.com'
      });

      console.log('Ban function response:', { data, error });

      if (error || !data?.success) {
        console.log('🔄 Function failed, using manual ban...');
        console.log('Function error details:', error);
        console.log('Function data:', data);

        // Fall back to manual banning
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + duration);

        console.log(`📅 Banning until: ${banUntil.toISOString()}`);

        const { data: insertData, error: manualError } = await supabase
          .from('banned_users')
          .upsert([
            {
              user_id: userId,
              banned_until: banUntil.toISOString(),
              banned_by: 'glowyboy01@gmail.com',
              reason: `Banni pour ${duration} jours par admin`
            }
          ])
          .select();

        if (manualError) {
          console.error('Manual ban error:', manualError);
          throw manualError;
        }

        console.log('✅ User banned manually:', insertData);
      } else {
        console.log('✅ User banned via function:', data);
      }

      toast({
        title: "🚫 Utilisateur banni avec succès",
        description: `L'utilisateur a été banni pour ${duration} jours`,
      });

      // Refresh the user list and banned users
      await fetchUsers();
      await fetchProfiles();
      await fetchBannedUsers();
    } catch (error: any) {
      console.error('❌ Ban error:', error);
      toast({
        title: "❌ Erreur de bannissement",
        description: error.message || "Impossible de bannir l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const manualUserDeletion = async (userId: string) => {
    console.log('🗄️ Performing manual database cleanup for user:', userId);

    // First, let's check what data exists for this user
    console.log('🔍 Checking user data before deletion...');

    const checks = [
      { name: 'client_profiles', query: supabase.from('client_profiles').select('*').eq('user_id', userId) },
      { name: 'laboratory_profiles', query: supabase.from('laboratory_profiles').select('*').eq('user_id', userId) },
      { name: 'PAD_requests (client)', query: supabase.from('PAD_requests').select('*').eq('client_id', userId) },
      { name: 'PAD_requests (lab)', query: supabase.from('PAD_requests').select('*').eq('laboratory_id', userId) },
      { name: 'notifications', query: supabase.from('notifications').select('*').eq('user_id', userId) },
      { name: 'medical_results (client)', query: supabase.from('medical_results').select('*').eq('client_id', userId) },
      { name: 'medical_results (lab)', query: supabase.from('medical_results').select('*').eq('laboratory_id', userId) },
      { name: 'file_uploads', query: supabase.from('file_uploads').select('*').eq('user_id', userId) },
      { name: 'banned_users', query: supabase.from('banned_users').select('*').eq('user_id', userId) }
    ];

    for (const check of checks) {
      try {
        const { data, error } = await check.query;
        if (error) {
          console.warn(`⚠️ Error checking ${check.name}:`, error);
        } else {
          console.log(`📊 Found in ${check.name}:`, data?.length || 0, 'records');
          if (data && data.length > 0) {
            console.log(`📋 Sample data from ${check.name}:`, data[0]);
          }
        }
      } catch (err) {
        console.warn(`⚠️ Failed to check ${check.name}:`, err);
      }
    }

    // Now perform deletions
    const deletions = [
      { name: 'client_profiles', promise: supabase.from('client_profiles').delete().eq('user_id', userId) },
      { name: 'laboratory_profiles', promise: supabase.from('laboratory_profiles').delete().eq('user_id', userId) },
      { name: 'PAD_requests (client)', promise: supabase.from('PAD_requests').delete().eq('client_id', userId) },
      { name: 'PAD_requests (lab)', promise: supabase.from('PAD_requests').delete().eq('laboratory_id', userId) },
      { name: 'notifications', promise: supabase.from('notifications').delete().eq('user_id', userId) },
      { name: 'medical_results (client)', promise: supabase.from('medical_results').delete().eq('client_id', userId) },
      { name: 'medical_results (lab)', promise: supabase.from('medical_results').delete().eq('laboratory_id', userId) },
      { name: 'file_uploads', promise: supabase.from('file_uploads').delete().eq('user_id', userId) },
      { name: 'banned_users', promise: supabase.from('banned_users').delete().eq('user_id', userId) }
    ];

    let totalDeleted = 0;
    for (const deletion of deletions) {
      try {
        const { error, count } = await deletion.promise;
        if (error) {
          console.warn(`⚠️ Error deleting from ${deletion.name}:`, error);
        } else {
          const deletedCount = count || 0;
          totalDeleted += deletedCount;
          console.log(`✅ Deleted from ${deletion.name}: ${deletedCount} rows`);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to delete from ${deletion.name}:`, err);
      }
    }

    console.log(`📊 Total records deleted: ${totalDeleted}`);

    toast({
      title: "🗑️ Utilisateur supprimé (manuel)",
      description: `${totalDeleted} enregistrements supprimés de la base de données`,
    });
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log(`🗑️ DELETING USER ${userId} FROM AUTH AND ALL DATA...`);

      // Step 1: Delete all files from storage buckets first
      console.log('📁 Cleaning up storage buckets...');
      const buckets = ['avatars', 'medical-results', 'lab-certificates', 'documents'];

      for (const bucket of buckets) {
        try {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(userId);

          if (files && files.length > 0) {
            const filePaths = files.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
              .from(bucket)
              .remove(filePaths);

            if (deleteError) {
              console.warn(`⚠️ Error deleting files from ${bucket}:`, deleteError);
            } else {
              console.log(`🗂️ Deleted ${files.length} files from ${bucket}`);
            }
          }
        } catch (bucketError) {
          console.warn(`⚠️ Bucket ${bucket} cleanup failed:`, bucketError);
        }
      }

      // Step 2: DELETE FROM ALL TABLES USING ADMIN FUNCTION
      console.log('🔥 DELETING FROM ALL TABLES...');
      const { data, error: deleteError } = await supabase.rpc('admin_delete_user_complete', {
        target_user_id: userId
      });

      if (deleteError) {
        console.error('❌ DELETE FAILED:', deleteError);
        toast({
          title: "❌ Erreur de suppression",
          description: `Impossible de supprimer l'utilisateur: ${deleteError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ USER DELETED FROM ALL TABLES:', data);

      toast({
        title: "🗑️ Utilisateur supprimé complètement",
        description: `${data.records_deleted} enregistrements supprimés de toutes les tables`,
      });

      // Refresh all lists
      await fetchUsers();
      await fetchProfiles();
      await fetchBannedUsers();

      console.log('🎉 COMPLETE USER DELETION FINISHED');
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      toast({
        title: "❌ Erreur de suppression",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      console.log(`✅ Unbanning user ${userId}...`);

      // Try the database function first
      const { data, error } = await supabase.rpc('admin_unban_user', {
        target_user_id: userId,
        admin_email: 'glowyboy01@gmail.com'
      });

      console.log('Unban function response:', { data, error });

      if (error || !data?.success) {
        console.log('🔄 Function failed, using manual unban...');

        // Fall back to manual unbanning
        const { error: manualError } = await supabase
          .from('banned_users')
          .delete()
          .eq('user_id', userId);

        if (manualError) {
          throw manualError;
        }

        console.log('✅ User unbanned manually');
      } else {
        console.log('✅ User unbanned via function:', data);
      }

      toast({
        title: "✅ Utilisateur débanni avec succès",
        description: "L'utilisateur peut maintenant se connecter",
      });

      // Refresh the banned users list
      await fetchBannedUsers();
      await fetchUsers();
    } catch (error: any) {
      console.error('❌ Unban error:', error);
      toast({
        title: "❌ Erreur de débannissement",
        description: error.message || "Impossible de débannir l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const getUserProfile = (userId: string) => {
    const clientProfile = clientProfiles.find(p => p.user_id === userId);
    const labProfile = labProfiles.find(p => p.user_id === userId);
    return clientProfile || labProfile;
  };

  const filteredUsers = users.filter(user => {
    const profile = getUserProfile(user.id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      profile?.full_name?.toLowerCase().includes(searchLower) ||
      profile?.phone?.includes(searchTerm) ||
      (profile as LabProfile)?.lab_name?.toLowerCase().includes(searchLower)
    );
  });

  const isUserBanned = (user: User) => {
    return bannedUsers.includes(user.id);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      console.log('🔍 Fetching ALL details for user:', userId);

      // Fetch ALL possible data for this user
      const [
        clientProfile,
        labProfile,
        padRequestsAsClient,
        padRequestsAsLab,
        notifications,
        medicalResultsAsClient,
        medicalResultsAsLab,
        banInfo
      ] = await Promise.all([
        supabase.from('client_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('laboratory_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('pad_requests').select('*').eq('client_id', userId),
        supabase.from('pad_requests').select('*').eq('laboratory_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId),
        supabase.from('medical_results').select('*').eq('client_id', userId),
        supabase.from('medical_results').select('*').eq('laboratory_id', userId),
        supabase.from('banned_users').select('*').eq('user_id', userId)
      ]);

      const details = {
        userId,
        clientProfile: clientProfile.data,
        labProfile: labProfile.data,
        padRequestsAsClient: padRequestsAsClient.data || [],
        padRequestsAsLab: padRequestsAsLab.data || [],
        notifications: notifications.data || [],
        medicalResultsAsClient: medicalResultsAsClient.data || [],
        medicalResultsAsLab: medicalResultsAsLab.data || [],
        banInfo: banInfo.data || [],
        totalPadRequests: (padRequestsAsClient.data?.length || 0) + (padRequestsAsLab.data?.length || 0),
        totalNotifications: notifications.data?.length || 0,
        totalMedicalResults: (medicalResultsAsClient.data?.length || 0) + (medicalResultsAsLab.data?.length || 0),
        isBanned: banInfo.data && banInfo.data.length > 0,
        userType: clientProfile.data ? 'Client' : labProfile.data ? 'Laboratoire' : 'Inconnu'
      };

      console.log('📊 User details fetched:', details);
      setUserDetails(details);
      setShowUserDetails(true);
    } catch (error) {
      console.error('❌ Error fetching user details:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'utilisateur",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panneau d'Administration</h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">Gestion des utilisateurs et modération</p>
                </div>
              </div>
            <Button
              onClick={async () => {
                console.log('🚪 Admin logout - clearing all data...');

                // Clear admin login logs
                try {
                  await supabase.auth.signOut();
                } catch (error) {
                  console.warn('Error signing out:', error);
                }

                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to auth
                window.location.href = '/auth';
              }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              <span>Déconnexion</span>
            </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-blue-700">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Clients</p>
                    <p className="text-2xl font-bold text-green-700">{clientProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Laboratoires</p>
                    <p className="text-2xl font-bold">{labProfiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Ban className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Utilisateurs Bannis</p>
                    <p className="text-2xl font-bold">{users.filter(isUserBanned).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Rechercher par email, nom, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Gérez les utilisateurs, bannissez ou supprimez des comptes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const profile = getUserProfile(user.id);
                  const isLab = labProfiles.some(lab => lab.user_id === user.id);
                  const isBanned = isUserBanned(user);

                  return (
                    <div key={user.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300">
                      {/* User Info Section */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            {isLab ? <Building2 className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-green-600" />}
                            <span className="font-semibold text-base sm:text-lg text-gray-800">
                              {profile?.full_name || (profile as LabProfile)?.lab_name || 'Nom non disponible'}
                            </span>
                          </div>
                          <Badge variant={isLab ? "secondary" : "default"} className="text-xs font-medium">
                            {isLab ? 'Laboratoire' : 'Client'}
                          </Badge>
                          {isBanned && (
                            <Badge variant="destructive" className="text-xs font-medium animate-pulse">
                              <Ban className="w-3 h-3 mr-1" />
                              Banni
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 flex-shrink-0 text-blue-500" />
                            <span className="truncate font-medium">{user.email}</span>
                          </div>
                          {profile?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 flex-shrink-0 text-green-500" />
                              <span className="font-medium">{profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0 text-purple-500" />
                            <span>Inscrit: {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {profile?.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0 text-red-500" />
                              <span className="truncate">{profile.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons Section - New Line */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchUserDetails(user.id)}
                            className="flex items-center gap-2 px-4 py-2 h-9 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Voir Détails</span>
                          </Button>

                          {isBanned ? (
                            <Button
                              size="sm"
                              onClick={() => unbanUser(user.id)}
                              className="flex items-center gap-2 px-4 py-2 h-9 bg-green-400 hover:bg-green-500 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <span>✅</span>
                              <span>Débannir</span>
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 px-4 py-2 h-9 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 transition-all duration-200"
                                >
                                  <Ban className="w-4 h-4" />
                                  <span>Bannir</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Bannir l'utilisateur</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir bannir cet utilisateur pour 30 jours ?
                                    Il ne pourra plus se connecter pendant cette période.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => banUser(user.id)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Bannir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 px-4 py-2 h-9 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Supprimer</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                  SUPPRESSION COMPLÈTE DE L'UTILISATEUR
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <div className="font-bold text-red-600">⚠️ ATTENTION: SUPPRESSION TOTALE ET IRRÉVERSIBLE</div>
                                  <div>Cette action supprimera TOUT ce qui concerne cet utilisateur :</div>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li><strong>Profils</strong> - Client/Laboratoire</li>
                                    <li><strong>Demandes PAD</strong> - Envoyées et reçues</li>
                                    <li><strong>Notifications</strong> - Toutes les notifications</li>
                                    <li><strong>Résultats médicaux</strong> - Tous les résultats</li>
                                    <li><strong>Fichiers</strong> - Photos, PDFs, documents</li>
                                    <li><strong>Historique</strong> - Logs et sessions</li>
                                    <li><strong>Références</strong> - Toutes les connexions</li>
                                  </ul>
                                  <div className="font-bold text-red-600">L'utilisateur sera complètement effacé du système.</div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer définitivement
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive User Details Dialog */}
          <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Détails Complets de l'Utilisateur
                </DialogTitle>
                <DialogDescription>
                  Toutes les informations disponibles sur cet utilisateur
                </DialogDescription>
              </DialogHeader>

              {userDetails && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations de Base</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>ID Utilisateur:</strong> {userDetails.userId}</div>
                        <div><strong>Type:</strong> {userDetails.userType}</div>
                        <div><strong>Statut:</strong> {userDetails.isBanned ? '🚫 BANNI' : '✅ Actif'}</div>
                        <div><strong>Total PAD:</strong> {userDetails.totalPadRequests}</div>
                        <div><strong>Total Notifications:</strong> {userDetails.totalNotifications}</div>
                        <div><strong>Total Résultats:</strong> {userDetails.totalMedicalResults}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Client Profile */}
                  {userDetails.clientProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profil Client</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Nom complet:</strong> {userDetails.clientProfile.full_name}</div>
                          <div><strong>Email:</strong> {userDetails.clientProfile.email}</div>
                          <div><strong>Téléphone:</strong> {userDetails.clientProfile.phone}</div>
                          <div><strong>Date de naissance:</strong> {userDetails.clientProfile.birth_date}</div>
                          <div className="col-span-2"><strong>Adresse:</strong> {userDetails.clientProfile.address}</div>
                          <div><strong>Créé le:</strong> {new Date(userDetails.clientProfile.created_at).toLocaleString('fr-FR')}</div>
                          <div><strong>Mis à jour:</strong> {new Date(userDetails.clientProfile.updated_at).toLocaleString('fr-FR')}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Laboratory Profile */}
                  {userDetails.labProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profil Laboratoire</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Nom du laboratoire:</strong> {userDetails.labProfile.lab_name}</div>
                          <div><strong>Email:</strong> {userDetails.labProfile.email}</div>
                          <div><strong>Téléphone:</strong> {userDetails.labProfile.phone}</div>
                          <div><strong>SIRET:</strong> {userDetails.labProfile.siret}</div>
                          <div className="col-span-2"><strong>Adresse:</strong> {userDetails.labProfile.address}</div>
                          <div><strong>Vérifié:</strong> {userDetails.labProfile.is_verified ? '✅ Oui' : '❌ Non'}</div>
                          <div><strong>Créé le:</strong> {new Date(userDetails.labProfile.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ban Information */}
                  {userDetails.banInfo.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-red-600">Informations de Bannissement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userDetails.banInfo.map((ban: any, index: number) => (
                          <div key={index} className="space-y-2 text-sm">
                            <div><strong>Banni jusqu'au:</strong> {new Date(ban.banned_until).toLocaleString('fr-FR')}</div>
                            <div><strong>Banni par:</strong> {ban.banned_by}</div>
                            <div><strong>Raison:</strong> {ban.reason}</div>
                            <div><strong>Date du ban:</strong> {new Date(ban.created_at).toLocaleString('fr-FR')}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* PAD Requests as Client */}
                  {userDetails.padRequestsAsClient.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Demandes PAD Envoyées ({userDetails.padRequestsAsClient.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.padRequestsAsClient.map((request: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-400 pl-3 text-sm">
                              <div><strong>Statut:</strong> {request.status}</div>
                              <div><strong>Message:</strong> {request.message}</div>
                              <div><strong>Date:</strong> {new Date(request.created_at).toLocaleString('fr-FR')}</div>
                              {request.client_location_lat && (
                                <div><strong>Position:</strong> {request.client_location_lat}, {request.client_location_lng}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* PAD Requests as Laboratory */}
                  {userDetails.padRequestsAsLab.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Demandes PAD Reçues ({userDetails.padRequestsAsLab.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.padRequestsAsLab.map((request: any, index: number) => (
                            <div key={index} className="border-l-4 border-green-400 pl-3 text-sm">
                              <div><strong>Statut:</strong> {request.status}</div>
                              <div><strong>Client:</strong> {request.client_name}</div>
                              <div><strong>Téléphone:</strong> {request.client_phone}</div>
                              <div><strong>Date:</strong> {new Date(request.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notifications */}
                  {userDetails.notifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notifications ({userDetails.notifications.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.notifications.map((notif: any, index: number) => (
                            <div key={index} className="border-l-4 border-yellow-400 pl-3 text-sm">
                              <div><strong>Titre:</strong> {notif.title}</div>
                              <div><strong>Message:</strong> {notif.message}</div>
                              <div><strong>Lu:</strong> {notif.read ? '✅ Oui' : '❌ Non'}</div>
                              <div><strong>Date:</strong> {new Date(notif.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medical Results */}
                  {(userDetails.medicalResultsAsClient.length > 0 || userDetails.medicalResultsAsLab.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Résultats Médicaux ({userDetails.totalMedicalResults})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {userDetails.medicalResultsAsClient.map((result: any, index: number) => (
                            <div key={`client-${index}`} className="border-l-4 border-purple-400 pl-3 text-sm">
                              <div><strong>Type:</strong> Résultat reçu (Client)</div>
                              <div><strong>Titre:</strong> {result.title}</div>
                              <div><strong>Description:</strong> {result.description}</div>
                              <div><strong>Date:</strong> {new Date(result.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                          {userDetails.medicalResultsAsLab.map((result: any, index: number) => (
                            <div key={`lab-${index}`} className="border-l-4 border-indigo-400 pl-3 text-sm">
                              <div><strong>Type:</strong> Résultat envoyé (Laboratoire)</div>
                              <div><strong>Titre:</strong> {result.title}</div>
                              <div><strong>Description:</strong> {result.description}</div>
                              <div><strong>Date:</strong> {new Date(result.created_at).toLocaleString('fr-FR')}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Raw Data (for debugging) */}
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Données Brutes (Debug)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                        {JSON.stringify(userDetails, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
