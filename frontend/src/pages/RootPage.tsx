import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { RootUser } from '../types';
import Modal from '../components/common/Modal';
import {
  LogOut, Users, Shield, UserCheck, Trash2,
  ChevronRight, BookOpen, BarChart3, AlertTriangle,
} from 'lucide-react';
import './RootPage.css';

export default function RootPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<RootUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RootUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.getRootUsers(user.id)
        .then((data) => setUsers(data.users))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleRole = async (target: RootUser) => {
    if (!user?.id || target.role === 'root') return;
    setActionLoading(true);
    try {
      const newRole = target.role === 'admin' ? 'student' : 'admin';
      await api.updateUserRole(target.userId, newRole, user.id);
      setUsers(users.map((u) =>
        u.userId === target.userId ? { ...u, role: newRole as RootUser['role'] } : u
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user?.id) return;
    setActionLoading(true);
    try {
      await api.deleteUser(deleteTarget.userId, user.id);
      setUsers(users.filter((u) => u.userId !== deleteTarget.userId));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const studentCount = users.filter((u) => u.role === 'student').length;

  const roleBadge = (role: string) => {
    if (role === 'root') return <span className="role-badge role-root">Root</span>;
    if (role === 'admin') return <span className="role-badge role-admin">관리자</span>;
    return <span className="role-badge role-student">학생</span>;
  };

  return (
    <div className="root-page">
      <header className="root-header">
        <div className="root-header-bg" />
        <div className="root-header-content">
          <div className="root-header-top">
            <div className="root-brand">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.2)" />
                <path d="M22 40 C22 30 27 22 32 20 C37 22 42 30 42 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="32" cy="27" r="3.5" fill="#fff" opacity="0.9"/>
              </svg>
              <span>GraspFit</span>
            </div>
            <button className="root-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
          <h1>루트 관리자</h1>
          <p>시스템 전체 사용자를 관리합니다.</p>
        </div>
      </header>

      <div className="root-content">
        {/* Summary */}
        <div className="root-summary">
          <div className="root-sum-card">
            <Users size={20} />
            <span className="root-sum-value">{totalUsers}</span>
            <span className="root-sum-label">전체 사용자</span>
          </div>
          <div className="root-sum-card">
            <Shield size={20} />
            <span className="root-sum-value">{adminCount}</span>
            <span className="root-sum-label">관리자</span>
          </div>
          <div className="root-sum-card">
            <UserCheck size={20} />
            <span className="root-sum-value">{studentCount}</span>
            <span className="root-sum-label">학생</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="root-nav-links">
          <button className="root-nav-btn" onClick={() => navigate('/admin')}>
            <BarChart3 size={18} />
            <span>관리자 대시보드</span>
            <ChevronRight size={16} />
          </button>
          <button className="root-nav-btn" onClick={() => navigate('/system')}>
            <BookOpen size={18} />
            <span>시스템 원리 설명</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* User table */}
        <h2 className="root-section-title">사용자 관리</h2>

        {loading ? (
          <div className="root-loading">데이터를 불러오는 중...</div>
        ) : (
          <div className="root-user-list">
            {users.map((u) => (
              <div key={u.userId} className="root-user-row">
                <div className="root-user-avatar">
                  {u.name.charAt(0)}
                </div>
                <div className="root-user-info">
                  <div className="root-user-name">{u.name}</div>
                  <div className="root-user-id">{u.studentId}</div>
                </div>
                {roleBadge(u.role)}
                <div className="root-user-stat">
                  {u.totalSessions}세션
                </div>
                <div className="root-user-actions">
                  {u.role !== 'root' && (
                    <>
                      <button
                        className="root-action-btn role-toggle-btn"
                        onClick={() => handleToggleRole(u)}
                        disabled={actionLoading}
                        title={u.role === 'admin' ? '학생으로 변경' : '관리자로 승격'}
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        className="root-action-btn delete-btn"
                        onClick={() => setDeleteTarget(u)}
                        disabled={actionLoading}
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div className="delete-confirm">
            <div className="delete-icon">
              <AlertTriangle size={40} />
            </div>
            <h2>사용자 삭제</h2>
            <p>
              <strong>{deleteTarget.name}</strong> ({deleteTarget.studentId})을(를) 삭제하시겠습니까?
              <br />모든 연습 기록과 피드백이 함께 삭제됩니다.
            </p>
            <div className="delete-actions">
              <button className="delete-cancel-btn" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
