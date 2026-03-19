import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Shield, Mail, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { changePassword, updateAccountEmail, deleteAccount } from '../api/endpoints';
import {
  changePasswordSchema,
  updateEmailSchema,
  type ChangePasswordFormData,
  type UpdateEmailFormData,
} from '../schemas/settingsSchema';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Password form
  const pwForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  // Email form
  const emailForm = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      pwForm.reset();
    } catch {
      toast.error('Failed to change password');
    }
  };

  const onUpdateEmail = async (data: UpdateEmailFormData) => {
    try {
      await updateAccountEmail({ newEmail: data.newEmail });
      toast.success('Verification email sent to new address');
      emailForm.reset();
    } catch {
      toast.error('Failed to update email');
    }
  };

  const onDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

      {/* Change Password */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Change Password</h2>
        </div>
        <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                {...pwForm.register('currentPassword')}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwForm.formState.errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1">{pwForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                {...pwForm.register('newPassword')}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwForm.formState.errors.newPassword && (
              <p className="text-xs text-red-400 mt-1">{pwForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              {...pwForm.register('confirmNewPassword')}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            />
            {pwForm.formState.errors.confirmNewPassword && (
              <p className="text-xs text-red-400 mt-1">{pwForm.formState.errors.confirmNewPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={pwForm.formState.isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {pwForm.formState.isSubmitting ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </section>

      {/* Update Email */}
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Update Email</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Current email: <span className="font-medium text-gray-300">{user?.email}</span>
        </p>
        <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">New Email Address</label>
            <input
              type="email"
              {...emailForm.register('newEmail')}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              placeholder="new@email.com"
            />
            {emailForm.formState.errors.newEmail && (
              <p className="text-xs text-red-400 mt-1">{emailForm.formState.errors.newEmail.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {emailForm.formState.isSubmitting ? 'Sending...' : 'Send Verification'}
          </button>
        </form>
      </section>

      {/* Delete Account */}
      <section className="bg-red-500/[0.04] rounded-2xl border border-red-500/15 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-red-400">Delete Account</h2>
        </div>
        <div className="flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-lg p-4 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">
            This action is permanent and cannot be undone. All your data, including your profile, collaborations, and messages, will be permanently deleted.
          </p>
        </div>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 font-medium">
              Type <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              placeholder="Type DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteInput(''); }}
                className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteAccount}
                disabled={deleteInput !== 'DELETE' || isDeleting}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
