import Layout from '../../components/Layout';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { Plus, Users, UserPlus, Database, Activity } from 'lucide-react';
import { fetchUsers, fetchUserStats } from '../../redux/actions/userActions';
import { getStatistics } from '../../redux/actions/diseaseActions';

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();

  const { users, loading: usersLoading, error: usersError, stats, statsLoading } = useSelector((state) => state.users);
  const { statistics, statisticsLoading, error: diseaseStatsError } = useSelector((state) => state.disease);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }));
    dispatch(fetchUserStats());
    dispatch(getStatistics());
  }, [dispatch]);

  const recentUsers = useMemo(() => Array.isArray(users) ? users.slice(0, 6) : [], [users]);

  const isLoading = usersLoading || statsLoading || statisticsLoading;
  const anyError = usersError || diseaseStatsError;

  if (isLoading) return <div>Loading...</div>;
  if (anyError) return <div>Error: {anyError}</div>;

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-md font-semibold text-gray-900">Super Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/users/new"
            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors text-sm"
          >
            <UserPlus size={16} />
            Create User
          </Link>
          <Link
            href="/dashboard/disease/add-disease"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Disease
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-xl font-semibold">{stats?.overview?.totalUsers ?? 0}</p>
            </div>
            <Users className="text-gray-400" size={24} />
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Users</p>
              <p className="text-xl font-semibold">{stats?.overview?.activeUsers ?? 0}</p>
            </div>
            <Activity className="text-gray-400" size={24} />
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Diseases Tracked</p>
              <p className="text-xl font-semibold">{statistics?.overview?.totalDiseases ?? 0}</p>
            </div>
            <Database className="text-gray-400" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3">Recent Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentUsers?.map((user) => (
              <div key={user._id} className="p-4 border rounded-lg hover:border-blue-400 transition-colors">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
                <p className="text-xs mt-1"><span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">{user.role}</span></p>
              </div>
            ))}
            {!recentUsers?.length && (
              <div className="text-sm text-gray-600">No users found.</div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3">Quick Links</h2>
          <div className="space-y-3">
            <Link href="/users" className="block p-3 border rounded-md hover:border-blue-400 text-sm">Manage Users</Link>
            <Link href="/dashboard/disease/disease" className="block p-3 border rounded-md hover:border-blue-400 text-sm">Browse Diseases</Link>
            <Link href="/dashboard/disease/add-disease" className="block p-3 border rounded-md hover:border-blue-400 text-sm">Add Disease</Link>
            <Link href="/dashboard/admin" className="block p-3 border rounded-md hover:border-blue-400 text-sm">Admin View</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
