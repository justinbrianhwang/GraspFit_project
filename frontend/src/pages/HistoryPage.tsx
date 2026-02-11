import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { PracticeRecord, UserStats, FeedbackItem } from '../types';
import {
  ArrowLeft, Camera, Calendar, ClipboardList,
  Clock, BarChart3, TrendingUp, CheckCircle, MessageSquare,
} from 'lucide-react';
import './HistoryPage.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.getRecords(user.id),
      api.getStats(user.id),
      api.getFeedback(user.id),
    ])
      .then(([recs, st, fbs]) => {
        setRecords(recs);
        setStats(st);
        setFeedbacks(fbs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="history-page">
      <header className="history-header">
        <button className="hist-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1>연습 기록</h1>
        <div className="header-spacer" />
      </header>

      <div className="history-content">
        {loading ? (
          <div className="history-loading">데이터를 불러오는 중...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <div className="empty-icon-bg">
                <ClipboardList size={48} />
              </div>
              <div className="empty-icon-ring" />
            </div>
            <h2>아직 기록이 없습니다</h2>
            <p>실습을 시작하면 여기에 기록이 표시됩니다.</p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={() => navigate('/camera')}>
                <Camera size={18} />
                실습 시작하기
              </button>
            </div>
            <div className="empty-tips">
              <div className="empty-tip">
                <Calendar size={16} />
                <span>주 3일, 하루 20분 이상 연습을 목표로 합니다</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats summary */}
            {stats && (
              <div className="hist-stats">
                <div className="hist-stat-card">
                  <div className="hist-stat-icon hist-stat-icon-sessions">
                    <CheckCircle size={18} />
                  </div>
                  <span className="hist-stat-value">{stats.totalSessions}</span>
                  <span className="hist-stat-label">총 세션</span>
                </div>
                <div className="hist-stat-card">
                  <div className="hist-stat-icon hist-stat-icon-time">
                    <Clock size={18} />
                  </div>
                  <span className="hist-stat-value">{Math.round(stats.totalMinutes)}분</span>
                  <span className="hist-stat-label">총 연습</span>
                </div>
                <div className="hist-stat-card">
                  <div className="hist-stat-icon hist-stat-icon-rate">
                    <BarChart3 size={18} />
                  </div>
                  <span className="hist-stat-value">{stats.correctRate}%</span>
                  <span className="hist-stat-label">평균 정확도</span>
                </div>
                <div className="hist-stat-card">
                  <div className="hist-stat-icon hist-stat-icon-weekly">
                    <TrendingUp size={18} />
                  </div>
                  <span className="hist-stat-value">{stats.weeklyDays}일</span>
                  <span className="hist-stat-label">이번 주</span>
                </div>
              </div>
            )}

            {/* Records list */}
            <h3 className="hist-section-title">연습 기록</h3>
            <div className="records-list">
              {records.map((r) => (
                <div
                  key={r.id}
                  className={`record-card ${r.correctRate >= 50 ? 'record-good' : 'record-poor'}`}
                >
                  <div className="record-card-date">
                    {new Date(r.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric', weekday: 'short',
                    })}
                  </div>
                  <div className="record-card-stats">
                    <span className="record-card-time">
                      <Clock size={14} /> {Math.round(r.durationSeconds / 60)}분
                    </span>
                    <span className="record-card-rate">
                      <BarChart3 size={14} /> {r.correctRate.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`record-card-badge ${r.correctRate >= 50 ? 'badge-good' : 'badge-poor'}`}>
                    {r.correctRate >= 50 ? '양호' : '개선 필요'}
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback from admin */}
            {feedbacks.length > 0 && (
              <>
                <h3 className="hist-section-title">
                  <MessageSquare size={16} /> 관리자 피드백
                </h3>
                <div className="hist-feedback-list">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="hist-feedback-item">
                      <div className="hist-feedback-meta">
                        <span className="hist-feedback-week">{fb.weekLabel || ''}</span>
                        <span className="hist-feedback-author">{fb.adminName}</span>
                        <span className="hist-feedback-date">
                          {new Date(fb.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="hist-feedback-text">{fb.content}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
