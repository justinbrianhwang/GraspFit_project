import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { User, Phone, Hash, Shield, Lock, Terminal } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [rootCode, setRootCode] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRootMode, setIsRootMode] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogoTap = () => {
    const next = logoTapCount + 1;
    setLogoTapCount(next);
    if (next >= 5) {
      setIsRootMode(true);
      setIsAdminMode(false);
      setAdminCode('');
      setLogoTapCount(0);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim() || !phone.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (isRootMode && !rootCode.trim()) {
      setError('개발자 코드를 입력해주세요.');
      return;
    }
    if (isAdminMode && !adminCode.trim()) {
      setError('관리자 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await api.createUser({
        studentId: studentId.trim(),
        name: name.trim(),
        phone: phone.trim(),
        ...(isRootMode ? { rootCode: rootCode.trim() } : {}),
        ...(isAdminMode ? { adminCode: adminCode.trim() } : {}),
      });
      login(userData);
      if (userData.role === 'root') navigate('/root');
      else if (userData.role === 'admin') navigate('/admin');
      else navigate('/guide');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formTitle = isRootMode ? '개발자 로그인' : isAdminMode ? '관리자 로그인' : '시작하기';
  const submitLabel = isRootMode ? '개발자 로그인' : isAdminMode ? '관리자 로그인' : '시작하기';

  return (
    <div className="login-page">
      <div className="login-bg-decor">
        <div className="decor-circle decor-1" />
        <div className="decor-circle decor-2" />
        <div className="decor-circle decor-3" />
      </div>

      <div className="login-card">
        <div className="logo-area">
          <div className="logo-icon" onClick={handleLogoTap} style={{ cursor: 'pointer' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="url(#grad)" />
              <path d="M22 40 C22 30 27 22 32 20 C37 22 42 30 42 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="32" cy="27" r="4" fill="#fff" opacity="0.9"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
                  <stop stopColor="#4DB6AC"/>
                  <stop offset="1" stopColor="#00796B"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="app-title">GraspFit</h1>
          <p className="app-subtitle">올바른 그립을 위한 스마트 솔루션</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRootMode && (
            <p className="root-mode-indicator">Developer Mode</p>
          )}
          <h2>{formTitle}</h2>

          <div className={`form-group ${focused === 'studentId' ? 'focused' : ''} ${studentId ? 'has-value' : ''}`}>
            <label htmlFor="studentId">학번</label>
            <div className="input-wrapper">
              <Hash size={18} className="input-icon" />
              <input
                id="studentId"
                type="text"
                className="input-field"
                placeholder="학번을 입력하세요"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onFocus={() => setFocused('studentId')}
                onBlur={() => setFocused('')}
              />
            </div>
          </div>

          <div className={`form-group ${focused === 'name' ? 'focused' : ''} ${name ? 'has-value' : ''}`}>
            <label htmlFor="name">이름</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
              />
            </div>
          </div>

          <div className={`form-group ${focused === 'phone' ? 'focused' : ''} ${phone ? 'has-value' : ''}`}>
            <label htmlFor="phone">전화번호</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                id="phone"
                type="tel"
                className="input-field"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
              />
            </div>
          </div>

          {isAdminMode && (
            <div className={`form-group admin-code-group ${focused === 'adminCode' ? 'focused' : ''} ${adminCode ? 'has-value' : ''}`}>
              <label htmlFor="adminCode">관리자 코드</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="adminCode"
                  type="password"
                  className="input-field"
                  placeholder="관리자 코드를 입력하세요"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onFocus={() => setFocused('adminCode')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>
          )}

          {isRootMode && (
            <div className={`form-group root-code-group ${focused === 'rootCode' ? 'focused' : ''} ${rootCode ? 'has-value' : ''}`}>
              <label htmlFor="rootCode">개발자 코드</label>
              <div className="input-wrapper">
                <Terminal size={18} className="input-icon" />
                <input
                  id="rootCode"
                  type="password"
                  className="input-field"
                  placeholder="개발자 코드를 입력하세요"
                  value={rootCode}
                  onChange={(e) => setRootCode(e.target.value)}
                  onFocus={() => setFocused('rootCode')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? '처리 중...' : submitLabel}
          </button>

          <p className="privacy-notice">
            입력된 정보는 연구 목적으로만 사용됩니다.
          </p>
        </form>

        {!isRootMode && (
          <button
            type="button"
            className="admin-toggle"
            onClick={() => { setIsAdminMode(!isAdminMode); setAdminCode(''); setError(''); }}
          >
            <Shield size={14} />
            <span>{isAdminMode ? '학생 로그인으로 전환' : '관리자 로그인'}</span>
          </button>
        )}
        {isRootMode && (
          <button
            type="button"
            className="admin-toggle"
            onClick={() => { setIsRootMode(false); setRootCode(''); setError(''); }}
          >
            <Shield size={14} />
            <span>일반 로그인으로 전환</span>
          </button>
        )}
      </div>
    </div>
  );
}
