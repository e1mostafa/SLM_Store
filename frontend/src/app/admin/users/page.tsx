'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.getUsers({ search: search || undefined, role: role || undefined, page, limit: 20 }).then(r => r.data),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => adminApi.updateUser(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated'); },
    onError: () => toast.error('Failed to update user'),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
        <span className="text-muted-foreground text-sm">{pagination?.total?.toLocaleString() || 0} users</span>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {['User', 'Role', 'Orders', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No users found</td></tr>
              ) : users.map((user: { id: string; name: string; email: string; avatar?: string; role: string; isActive: boolean; createdAt: string; _count?: { orders: number } }) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amazon-orange/10 flex items-center justify-center text-amazon-orange font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                      user.role === 'SELLER' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{user._count?.orders || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isActive ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateUser.mutate({ id: user.id, data: { isActive: !user.isActive } })}
                        className={`p-1.5 rounded transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                        title={user.isActive ? 'Suspend user' : 'Activate user'}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === p ? 'bg-amazon-orange text-white' : 'border border-border text-foreground hover:bg-muted'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
