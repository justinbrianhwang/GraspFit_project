import { useNavigate } from 'react-router-dom';
import { Camera, Hand, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import './GuidePage.css';

const steps = [
  {
    icon: <Camera size={28} />,
    title: '카메라 설정',
    desc: '카메라를 손이 잘 보이는 위치에 고정하세요. 손등이 위를 향하도록 촬영합니다. 밝은 곳에서 배경과 손이 구분되게 하세요.',
    color: '#4DB6AC',
  },
  {
    icon: <Hand size={28} />,
    title: '기구 잡기',
    desc: 'Explorer를 올바른 변형 집필법(Modified Pen Grasp)으로 잡아주세요.',
    color: '#FF8A65',
  },
  {
    icon: <CheckCircle size={28} />,
    title: '실시간 피드백',
    desc: '초록색은 올바른 그립, 빨간색은 교정이 필요한 그립입니다. 화면의 안내에 따라 자세를 교정하세요.',
    color: '#4CAF50',
  },
  {
    icon: <Clock size={28} />,
    title: '연습 시간 기록',
    desc: '연습 시간이 자동으로 기록됩니다. 최소 하루 20분 이상, 주 3일 이상 연습을 목표로 합니다.',
    color: '#64B5F6',
  },
];

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="guide-page">
      <div className="guide-container">
        <div className="guide-header">
          <div className="guide-header-icon">
            <AlertCircle size={32} />
          </div>
          <h1>사용 가이드</h1>
          <p>GraspFit으로 올바른 그립을 연습하는 방법</p>
        </div>

        <div className="guide-steps">
          {steps.map((step, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="step-number">{i + 1}</div>
              <div className="step-icon" style={{ background: `${step.color}15`, color: step.color }}>
                {step.icon}
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="camera-angle-guide">
          <h3>촬영 각도 안내</h3>
          <div className="angle-tips">
            <div className="tip-item tip-good">
              <span className="tip-badge tip-check">O</span>
              <span>손등이 카메라를 향하게 하세요</span>
            </div>
            <div className="tip-item tip-good">
              <span className="tip-badge tip-check">O</span>
              <span>손과 카메라 거리: 약 20~30cm</span>
            </div>
            <div className="tip-item tip-bad">
              <span className="tip-badge tip-cross">X</span>
              <span>손가락이 카메라를 가리지 않게 하세요</span>
            </div>
            <div className="tip-item tip-bad">
              <span className="tip-badge tip-cross">X</span>
              <span>어두운 환경은 인식이 어려울 수 있습니다</span>
            </div>
          </div>
        </div>

        <div className="guide-reference">
          <h3>올바른 그립 참고 이미지</h3>
          <div className="reference-img-wrap">
            <img
              src="/images/explorer_correct.jpeg"
              alt="올바른 Explorer 그립"
              className="reference-img"
            />
          </div>
        </div>

        <div className="guide-footer">
          <button className="btn-primary start-btn" onClick={() => navigate('/')}>
            시작하기 <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
