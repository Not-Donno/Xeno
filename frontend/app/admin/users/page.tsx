'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatDate } from '@/lib/utils';
import type { User, PaginatedResponse } from '@/lib/types';

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (role) params.set('role', role);
    try {
      const res = await api.get<PaginatedResponse<User>>(`/admin/users?${params.toString()}`, token);
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, page, debouncedSearch, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleActive = async (user: User) => {
    setActionLoading(user.id);
    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive }, token);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (user: User, newRole: string) => {
    setActionLoading(user.id);
    try {
      await api.patch(`/admin/users/${user.id}`, { role: newRole }, token);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole as User['role'] } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string) => {
    setActionLoading(id);
    try {
      await api.delete(`/admin/users/${id}`, token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-star-white">Users</h2>
        <p className="text-sm text-star-blue/60 mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-star-blue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-10 w-72"
          />
        </div>
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'CUSTOMER', label: 'Customer' },
            { value: 'VENDOR', label: 'Vendor' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
          className="w-40"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load users"
            description={error}
            action={{ label: 'Retry', onClick: fetchUsers }}
          />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-light/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-star-blue/50 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-star-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-star-blue/40">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.role}
                          onChange={(e) => changeRole(user, e.target.value)}
                          options={[
                            { value: 'CUSTOMER', label: 'Customer' },
                            { value: 'VENDOR', label: 'Vendor' },
                            { value: 'ADMIN', label: 'Admin' },
                          ]}
                          className="w-32 py-1.5 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-star-blue/60">
                        {user.createdAt ? formatDate(user.createdAt) : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={actionLoading === user.id}
                            onClick={() => toggleActive(user)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {deleteConfirm === user.id ? (
                            <>
                              <Button
                                variant="danger"
                                size="sm"
                                loading={actionLoading === user.id}
                                onClick={() => deleteUser(user.id)}
                              >
                                Confirm
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(user.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
                <p className="text-sm text-star-blue/60">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
