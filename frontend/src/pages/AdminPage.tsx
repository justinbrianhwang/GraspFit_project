import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type AdminStudent } from '../lib/api';
import type { PracticeRecord, FeedbackItem } from '../types';
import Modal from '../components/common/Modal';
import {
  LogOut, Users, CheckCircle, TrendingUp,
  Clock, BarChart3, Send, MessageSquare,
  ChevronRight, Award, AlertCircle, BookOpen,
} from 'lucide-react';
import './AdminPage.css';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [studentRecords, setStudentRecords] = useState<PracticeRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [sending, setSending] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.getStudents(user.id)
        .then((data) => setStudents(data.students))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openDetail = async (student: AdminStudent) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    setFeedbackText('');
    try {
      const [records, fbs] = await Promise.all([
        api.getStudentRecords(student.userId, user!.id!),
        api.getFeedback(student.userId),
      ]);
      setStudentRecords(records);
      setFeedbacks(fbs);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || !selectedStudent || !user?.id) return;
    setSending(true);
    try {
      const now = new Date();
      const weekNum = getWeekNumber(now);
      const weekLabel = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      const fb = await api.createFeedback({
        adminId: user.id,
        studentId: selectedStudent.userId,
        content: feedbackText.trim(),
        weekLabel,
      });
      setFeedbacks([fb, ...feedbacks]);
      setFeedbackText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const totalStudents = students.length;
  const goalMet = students.filter((s) => s.meetsWeeklyGoal).length;
  const avgRate = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + s.correctRate, 0) / totalStudents)
    : 0;

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-bg" />
        <div className="admin-header-content">
          <div className="admin-header-top">
            <div className="admin-brand">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.2)" />
                <path d="M22 40 C22 30 27 22 32 20 C37 22 42 30 42 40" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="32" cy="27" r="3.5" fill="#fff" opacity="0.9"/>
              </svg>
              <span>GraspFit</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
          <h1>관리자 대시보드</h1>
          <p>{user?.name}님, 학생들의 연습 현황을 확인하세요.</p>
        </div>
      </header>

      <div className="admin-content">
        {/* Summary cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon summary-icon-users">
              <Users size={20} />
            </div>
            <span className="summary-value">{totalStudents}</span>
            <span className="summary-label">전체 학생</span>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon-goal">
              <Award size={20} />
            </div>
            <span className="summary-value">{goalMet}</span>
            <span className="summary-label">주간 목표 달성</span>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon-rate">
              <TrendingUp size={20} />
            </div>
            <span className="summary-value">{avgRate}%</span>
            <span className="summary-label">평균 정확도</span>
          </div>
        </div>

        {/* Student list */}
        <h2 className="section-heading">학생 목록</h2>

        {loading ? (
          <div className="admin-loading">데이터를 불러오는 중...</div>
        ) : students.length === 0 ? (
          <div className="admin-empty">
            <AlertCircle size={32} />
            <p>등록된 학생이 없습니다.</p>
          </div>
        ) : (
          <div className="student-list">
            {students.map((s) => (
              <button key={s.userId} className="student-card" onClick={() => openDetail(s)}>
                <div className="student-avatar">
                  {s.name.charAt(0)}
                </div>
                <div className="student-info">
                  <div className="student-name">{s.name}</div>
                  <div className="student-id">{s.studentId}</div>
                </div>
                <div className="student-stats-mini">
                  <span className="mini-stat">
                    <Clock size={12} /> {Math.round(s.totalMinutes)}분
                  </span>
                  <span className="mini-stat">
                    <BarChart3 size={12} /> {s.correctRate}%
                  </span>
                </div>
                {s.meetsWeeklyGoal ? (
                  <span className="goal-badge goal-met">
                    <CheckCircle size={12} /> 달성
                  </span>
                ) : (
                  <span className="goal-badge goal-not">
                    미달성
                  </span>
                )}
                <ChevronRight size={16} className="student-chevron" />
              </button>
            ))}
          </div>
        )}

        {/* System link */}
        <button
          className="student-card"
          style={{ justifyContent: 'center', gap: 8, marginTop: 20 }}
          onClick={() => navigate('/system')}
        >
          <BookOpen size={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>시스템 원리 설명</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Student detail modal */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)}>
        {selectedStudent && (
          <div className="detail-content">
            <div className="detail-header-info">
              <div className="detail-avatar">{selectedStudent.name.charAt(0)}</div>
              <div>
                <h2>{selectedStudent.name}</h2>
                <p className="detail-student-id">{selectedStudent.studentId}</p>
              </div>
            </div>

            {/* Stats summary */}
            <div className="detail-stats">
              <div className="detail-stat-item">
                <span className="detail-stat-value">{Math.round(selectedStudent.totalMinutes)}분</span>
                <span className="detail-stat-label">총 연습</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-value">{selectedStudent.correctRate}%</span>
                <span className="detail-stat-label">정확도</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-value">{selectedStudent.weeklyDays}일</span>
                <span className="detail-stat-label">주간 연습</span>
              </div>
              <div className="detail-stat-item">
                <span className="detail-stat-value">{selectedStudent.totalSessions}</span>
                <span className="detail-stat-label">총 세션</span>
              </div>
            </div>

            {/* Records */}
            <h3 className="detail-section-title">연습 기록</h3>
            {detailLoading ? (
              <p className="detail-loading">로딩 중...</p>
            ) : studentRecords.length === 0 ? (
              <p className="detail-empty">기록이 없습니다.</p>
            ) : (
              <div className="detail-records">
                {studentRecords.slice(0, 20).map((r) => (
                  <div key={r.id} className={`detail-record ${r.correctRate >= 50 ? 'good' : 'poor'}`}>
                    <div className="record-date-col">
                      {new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="record-time-col">
                      {Math.round(r.durationSeconds / 60)}분
                    </div>
                    <div className="record-rate-col">
                      {r.correctRate.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback section */}
            <h3 className="detail-section-title">
              <MessageSquare size={16} /> 피드백
            </h3>

            <div className="feedback-input-wrap">
              <textarea
                className="feedback-textarea"
                placeholder="이번 주 피드백을 작성하세요..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
              />
              <button
                className="feedback-send-btn"
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim() || sending}
              >
                <Send size={16} />
                {sending ? '전송 중...' : '전송'}
              </button>
            </div>

            {feedbacks.length > 0 && (
              <div className="feedback-list">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="feedback-item">
                    <div className="feedback-meta">
                      <span className="feedback-week">{fb.weekLabel || ''}</span>
                      <span className="feedback-date">
                        {new Date(fb.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="feedback-text">{fb.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}
