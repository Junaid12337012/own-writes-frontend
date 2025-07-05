import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { fetchUsers, deleteUser, updateUserRole } from '../../services/adminService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoles, setNewRoles] = useState<Record<string, UserRole>>({});
  const { addToast } = useNotification();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersFromApi = await fetchUsers();
      setUsers(usersFromApi);
    } catch (error) {
      addToast({ message: 'Failed to load users.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // No edit mode needed

  const handleSaveUserRole = async (userId: string) => {
    try {
      const updatedUser = await updateUserRole(userId, newRoles[userId]);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      addToast({ message: `User ${updatedUser.username}'s role updated to ${newRoles[userId]}.`, type: 'success' });
    } catch (error) {
      addToast({ message: 'Failed to update user role.', type: 'error' });
    }
  };


  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}? This action is irreversible.`)) {
      try {
        await deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        addToast({ message: `User ${username} deleted successfully.`, type: 'success' });
      } catch (error: any) {
        const message = error?.message || `Failed to delete user ${username}. An unknown error occurred.`;
        addToast({ message, type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark">User Management</h3>
      {users.length === 0 ? <p className="text-brand-text-muted dark:text-brand-text-muted-dark">No users found.</p> : (
        <div className="overflow-x-auto bg-brand-surface dark:bg-brand-surface-dark shadow-sm rounded-lg border border-brand-border dark:border-brand-border-dark">
          <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
            <thead className="bg-brand-bg dark:bg-brand-surface-dark/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface dark:bg-brand-surface-dark divide-y divide-brand-border dark:divide-brand-border-dark">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text dark:text-brand-text-dark">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
                    <select
                      value={newRoles[user.id] ?? user.role}
                      onChange={e => setNewRoles(prev => ({ ...prev, [user.id]: e.target.value as UserRole }))}
                      className="block w-full pl-3 pr-10 py-1.5 text-base border-brand-border dark:border-brand-border-dark bg-brand-bg dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm rounded-lg"
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role} disabled={role === UserRole.ADMIN && user.role !== UserRole.ADMIN }>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <Button size="sm" onClick={() => handleSaveUserRole(user.id)}>Save</Button>
                    {user.role !== UserRole.ADMIN && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id, user.username)} title="Delete User" className="p-1.5">
                        <TrashIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-red-500 dark:hover:text-red-400"/>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;