import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { RootUser } from '../types';
import Modal from '../components/common/Modal';
import {
  LogOut, Users, Shield, UserCheck, Trash2,
  ChevronRight, BookOpen, BarChart3, AlertTriangle, Sliders, UserPlus,
} from 'lucide-react';
import './RootPage.css';

export default function RootPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<RootUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RootUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Student registration modal
  const [showRegister, setShowRegister] = useState(false);
  const [regStudentId, setRegStudentId] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Threshold state
  const [currentThreshold, setCurrentThreshold] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(0.00729);
  const [thresholdSaving, setThresholdSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.getRootUsers(user.id)
        .then((data) => setUsers(data.users))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    api.getThreshold()
      .then((data) => {
        setCurrentThreshold(data.threshold);
        setSliderValue(data.threshold);
      })
      .catch(console.error);
  }, [user?.id]);

  const handleSaveThreshold = async () => {
    if (!user?.id) return;
    setThresholdSaving(true);
    try {
      const data = await api.updateThreshold(sliderValue, user.id);
      setCurrentThreshold(data.threshold);
    } catch (err) {
      console.error(err);
    } finally {
      setThresholdSaving(false);
    }
  };

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

  const handleRegisterStudent = async () => {
    if (!user?.id) return;
    if (!regStudentId.trim() || !regName.trim() || !regPhone.trim()) {
      setRegError('모든 항목을 입력해주세요.');
      return;
    }
    setRegLoading(true);
    setRegError('');
    try {
      const newUser = await api.registerStudent(
        { studentId: regStudentId.trim(), name: regName.trim(), phone: regPhone.trim() },
        user.id,
      );
      // Add to list if not already present
      const newId = newUser.id!;
      if (!users.find((u) => u.userId === newId)) {
        setUsers([...users, {
          userId: newId,
          studentId: newUser.studentId,
          name: newUser.name,
          phone: newUser.phone,
          role: (newUser.role ?? 'student') as RootUser['role'],
          totalSessions: 0,
          totalMinutes: 0,
          correctRate: 0,
          createdAt: new Date().toISOString(),
        }]);
      }
      setShowRegister(false);
      setRegStudentId('');
      setRegName('');
      setRegPhone('');
    } catch (err) {
      setRegError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setRegLoading(false);
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

        {/* Threshold slider */}
        <div className="root-threshold-section">
          <h2 className="root-section-title">
            <Sliders size={16} /> MSE 임계값 조정
          </h2>
          <div className="root-threshold-card">
            <div className="root-threshold-labels">
              <span className="root-threshold-strict">더 엄격</span>
              <span className="root-threshold-lenient">더 관대</span>
            </div>
            <input
              type="range"
              className="root-threshold-slider"
              min={0.001}
              max={0.05}
              step={0.0001}
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
            />
            <div className="root-threshold-values">
              <span>현재: {currentThreshold?.toFixed(6) ?? '...'}</span>
              <span>설정: {sliderValue.toFixed(6)}</span>
            </div>
            <button
              className="root-threshold-save-btn"
              onClick={handleSaveThreshold}
              disabled={thresholdSaving || sliderValue === currentThreshold}
            >
              {thresholdSaving ? '저장 중...' : '임계값 저장'}
            </button>
          </div>
        </div>

        {/* User table */}
        <div className="root-section-header">
          <h2 className="root-section-title">사용자 관리</h2>
          <button className="root-register-btn" onClick={() => { setShowRegister(true); setRegError(''); }}>
            <UserPlus size={14} />
            <span>학생 등록</span>
          </button>
        </div>

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

      {/* Student registration modal */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)}>
        <div className="register-form">
          <h2>학생 등록</h2>
          <p className="register-desc">새 학생을 사전 등록합니다.</p>
          <div className="register-field">
            <label>학번</label>
            <input
              type="text"
              placeholder="학번을 입력하세요"
              value={regStudentId}
              onChange={(e) => setRegStudentId(e.target.value)}
            />
          </div>
          <div className="register-field">
            <label>이름</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
          </div>
          <div className="register-field">
            <label>전화번호</label>
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
            />
          </div>
          {regError && <p className="register-error">{regError}</p>}
          <div className="register-actions">
            <button className="delete-cancel-btn" onClick={() => setShowRegister(false)}>
              취소
            </button>
            <button
              className="register-submit-btn"
              onClick={handleRegisterStudent}
              disabled={regLoading}
            >
              {regLoading ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>
      </Modal>

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
