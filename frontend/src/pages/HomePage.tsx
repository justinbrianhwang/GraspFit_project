import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { UserStats } from '../types';
import {
  Camera, History, BookOpen, LogOut, ChevronRight,
  Target, Clock, TrendingUp, BarChart3, Shield, Terminal,
} from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { user, logout, isAdmin, isRoot } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (user?.id) {
      api.getStats(user.id).then(setStats).catch(console.error);
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-page">
      {/* Hero header */}
      <header className="home-hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-top">
            <div className="hero-brand">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.2)" />
                <path d="M22 40 C22 30 27 22 32 20 C37 22 42 30 42 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="32" cy="27" r="3.5" fill="#fff" opacity="0.9"/>
              </svg>
              <span className="hero-logo-text">GraspFit</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="로그아웃">
              <LogOut size={18} />
            </button>
          </div>
          <div className="hero-greeting">
            <h1>{user?.name}님, 안녕하세요!</h1>
            <p>오늘도 올바른 그립을 연습해보세요.</p>
          </div>
        </div>
      </header>

      <div className="home-content">
        {/* Quick stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-target">
              <Target size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats ? `${Math.round(stats.totalMinutes)}분` : '--'}</span>
              <span className="stat-label">총 연습 시간</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-clock">
              <BarChart3 size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats ? `${stats.correctRate}%` : '--'}</span>
              <span className="stat-label">평균 정확도</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-trend">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats ? `${stats.weeklyDays}일` : '--'}</span>
              <span className="stat-label">이번 주</span>
            </div>
          </div>
        </div>

        {/* Instrument cards */}
        <div className="instrument-section">
          <h3 className="section-title">실습 기구</h3>
          <div className="instrument-cards">
            <div className="instrument-card" onClick={() => navigate('/camera')}>
              <img src="/images/explorer.jpeg" alt="Explorer" className="instrument-img" />
              <div className="instrument-info">
                <h4>Explorer</h4>
                <p>Modified Pen Grasp</p>
                <span className="instrument-badge">기본 기구</span>
              </div>
            </div>
            <div className="instrument-card coming-soon-card">
              <div className="instrument-img coming-soon-img">
                <Clock size={24} />
              </div>
              <div className="instrument-info">
                <h4>새 기구</h4>
                <p>준비 중</p>
                <span className="instrument-badge coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main actions */}
        <div className="action-buttons">
          <button className="action-btn capture-btn" onClick={() => navigate('/camera')}>
            <div className="action-icon-wrap">
              <Camera size={32} />
            </div>
            <div className="action-text">
              <span className="action-title">실습 시작</span>
              <span className="action-desc">카메라로 그립 분석</span>
            </div>
            <ChevronRight size={20} className="action-arrow" />
          </button>
          <button className="action-btn history-btn" onClick={() => navigate('/history')}>
            <div className="action-icon-wrap">
              <History size={32} />
            </div>
            <div className="action-text">
              <span className="action-title">기록 보기</span>
              <span className="action-desc">연습 히스토리 확인</span>
            </div>
            <ChevronRight size={20} className="action-arrow" />
          </button>
        </div>

        {/* Guide link */}
        <button className="guide-link" onClick={() => navigate('/guide')}>
          <BookOpen size={18} />
          <span>사용 가이드 다시 보기</span>
          <ChevronRight size={16} />
        </button>

        {/* Admin/Root links */}
        {isAdmin && (
          <button className="guide-link admin-link" onClick={() => navigate('/admin')}>
            <Shield size={18} />
            <span>관리자 대시보드</span>
            <ChevronRight size={16} />
          </button>
        )}
        {isRoot && (
          <button className="guide-link root-link" onClick={() => navigate('/root')}>
            <Terminal size={18} />
            <span>루트 관리자</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
