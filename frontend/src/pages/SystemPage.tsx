import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import './SystemPage.css';

const SECTIONS = [
  { id: 'overview', label: '시스템 개요' },
  { id: 'landmarks', label: '손 랜드마크' },
  { id: 'normalization', label: '키포인트 정규화' },
  { id: 'autoencoder', label: '오토인코더' },
  { id: 'threshold', label: 'MSE 분류' },
  { id: 'grip', label: '그립 원리' },
  { id: 'realtime', label: '실시간 분석' },
  { id: 'data', label: '데이터 수집' },
  { id: 'evaluation', label: '평가 지표' },
];

export default function SystemPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`sys-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="system-page">
      <header className="sys-header">
        <button className="sys-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>시스템 원리 설명</h1>
        <div style={{ width: 40 }} />
      </header>

      {/* Section navigation */}
      <nav className="sys-nav">
        <div className="sys-nav-scroll">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`sys-nav-btn ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="sys-content" ref={contentRef}>
        {/* 1. System Overview */}
        <section id="sys-overview" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">01</span>
            시스템 개요
          </h2>
          <p className="sys-desc">
            GraspFit은 치과 기구(Explorer)의 올바른 Modified Pen Grasp를 실시간으로 감지하고
            피드백을 제공하는 웹 기반 시스템입니다. 카메라로 촬영된 손 영상을 분석하여
            그립의 정확성을 판별합니다.
          </p>

          <div className="sys-diagram">
            <div className="pipeline-flow">
              <div className="pipeline-node pipeline-input">
                <div className="pipeline-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="6" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="16" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <span>Camera Input</span>
              </div>
              <ChevronRight size={16} className="pipeline-arrow" />
              <div className="pipeline-node pipeline-process">
                <div className="pipeline-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L16 8M16 24L16 28M4 16H8M24 16H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="16" cy="16" r="2" fill="currentColor"/>
                  </svg>
                </div>
                <span>MediaPipe</span>
                <small>Hand Landmarks</small>
              </div>
              <ChevronRight size={16} className="pipeline-arrow" />
              <div className="pipeline-node pipeline-process">
                <div className="pipeline-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M6 26L16 6L26 26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M10 18H22" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Normalization</span>
                <small>63 Features</small>
              </div>
              <ChevronRight size={16} className="pipeline-arrow" />
              <div className="pipeline-node pipeline-process">
                <div className="pipeline-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M4 16H8L12 8L16 24L20 12L24 18H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Autoencoder</span>
                <small>ONNX Runtime</small>
              </div>
              <ChevronRight size={16} className="pipeline-arrow" />
              <div className="pipeline-node pipeline-output">
                <div className="pipeline-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M8 16L14 22L24 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Classification</span>
                <small>Correct / Incorrect</small>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>핵심 기술 스택</h4>
            <div className="sys-tech-grid">
              <div className="sys-tech-item">
                <strong>Frontend</strong>
                <span>React + TypeScript + Vite</span>
              </div>
              <div className="sys-tech-item">
                <strong>Backend</strong>
                <span>FastAPI + PostgreSQL</span>
              </div>
              <div className="sys-tech-item">
                <strong>AI / ML</strong>
                <span>MediaPipe + ONNX Runtime</span>
              </div>
              <div className="sys-tech-item">
                <strong>Deployment</strong>
                <span>Render + Neon DB</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Hand Landmarks */}
        <section id="sys-landmarks" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">02</span>
            손 랜드마크 감지
          </h2>
          <p className="sys-desc">
            Google MediaPipe Hands 모델을 사용하여 손의 21개 키포인트를 실시간으로
            감지합니다. 각 키포인트는 3D 좌표(x, y, z)를 가지며, 이를 통해 손의
            자세와 손가락 위치를 정밀하게 추적합니다.
          </p>

          <div className="sys-diagram">
            <svg className="landmark-svg" viewBox="0 0 320 360" fill="none">
              {/* Palm base */}
              <circle cx="160" cy="300" r="6" fill="#4DB6AC"/>
              <text x="175" y="305" className="lm-label">0 (Wrist)</text>

              {/* Thumb */}
              <line x1="160" y1="300" x2="120" y2="260" stroke="#E57373" strokeWidth="2"/>
              <line x1="120" y1="260" x2="90" y2="225" stroke="#E57373" strokeWidth="2"/>
              <line x1="90" y1="225" x2="65" y2="195" stroke="#E57373" strokeWidth="2"/>
              <line x1="65" y1="195" x2="45" y2="170" stroke="#E57373" strokeWidth="2"/>
              <circle cx="120" cy="260" r="5" fill="#E57373"/>
              <circle cx="90" cy="225" r="5" fill="#E57373"/>
              <circle cx="65" cy="195" r="5" fill="#E57373"/>
              <circle cx="45" cy="170" r="5" fill="#E57373"/>
              <text x="30" y="160" className="lm-label" fill="#E57373">Thumb (1-4)</text>

              {/* Index */}
              <line x1="160" y1="300" x2="140" y2="220" stroke="#64B5F6" strokeWidth="2"/>
              <line x1="140" y1="220" x2="130" y2="160" stroke="#64B5F6" strokeWidth="2"/>
              <line x1="130" y1="160" x2="125" y2="110" stroke="#64B5F6" strokeWidth="2"/>
              <line x1="125" y1="110" x2="120" y2="70" stroke="#64B5F6" strokeWidth="2"/>
              <circle cx="140" cy="220" r="5" fill="#64B5F6"/>
              <circle cx="130" cy="160" r="5" fill="#64B5F6"/>
              <circle cx="125" cy="110" r="5" fill="#64B5F6"/>
              <circle cx="120" cy="70" r="5" fill="#64B5F6"/>
              <text x="70" y="65" className="lm-label" fill="#64B5F6">Index (5-8)</text>

              {/* Middle */}
              <line x1="160" y1="300" x2="165" y2="215" stroke="#81C784" strokeWidth="2"/>
              <line x1="165" y1="215" x2="168" y2="150" stroke="#81C784" strokeWidth="2"/>
              <line x1="168" y1="150" x2="170" y2="95" stroke="#81C784" strokeWidth="2"/>
              <line x1="170" y1="95" x2="172" y2="50" stroke="#81C784" strokeWidth="2"/>
              <circle cx="165" cy="215" r="5" fill="#81C784"/>
              <circle cx="168" cy="150" r="5" fill="#81C784"/>
              <circle cx="170" cy="95" r="5" fill="#81C784"/>
              <circle cx="172" cy="50" r="5" fill="#81C784"/>
              <text x="180" y="45" className="lm-label" fill="#81C784">Middle (9-12)</text>

              {/* Ring */}
              <line x1="160" y1="300" x2="190" y2="220" stroke="#FFB74D" strokeWidth="2"/>
              <line x1="190" y1="220" x2="200" y2="165" stroke="#FFB74D" strokeWidth="2"/>
              <line x1="200" y1="165" x2="208" y2="115" stroke="#FFB74D" strokeWidth="2"/>
              <line x1="208" y1="115" x2="215" y2="75" stroke="#FFB74D" strokeWidth="2"/>
              <circle cx="190" cy="220" r="5" fill="#FFB74D"/>
              <circle cx="200" cy="165" r="5" fill="#FFB74D"/>
              <circle cx="208" cy="115" r="5" fill="#FFB74D"/>
              <circle cx="215" cy="75" r="5" fill="#FFB74D"/>
              <text x="222" y="70" className="lm-label" fill="#FFB74D">Ring (13-16)</text>

              {/* Pinky */}
              <line x1="160" y1="300" x2="215" y2="235" stroke="#BA68C8" strokeWidth="2"/>
              <line x1="215" y1="235" x2="235" y2="190" stroke="#BA68C8" strokeWidth="2"/>
              <line x1="235" y1="190" x2="250" y2="150" stroke="#BA68C8" strokeWidth="2"/>
              <line x1="250" y1="150" x2="260" y2="115" stroke="#BA68C8" strokeWidth="2"/>
              <circle cx="215" cy="235" r="5" fill="#BA68C8"/>
              <circle cx="235" cy="190" r="5" fill="#BA68C8"/>
              <circle cx="250" cy="150" r="5" fill="#BA68C8"/>
              <circle cx="260" cy="115" r="5" fill="#BA68C8"/>
              <text x="265" y="110" className="lm-label" fill="#BA68C8">Pinky (17-20)</text>
            </svg>
          </div>

          <div className="sys-info-box">
            <h4>MediaPipe 설정</h4>
            <table className="sys-table">
              <tbody>
                <tr><td>모델</td><td>MediaPipe Hands (hand_landmarker)</td></tr>
                <tr><td>최대 손 개수</td><td>1</td></tr>
                <tr><td>감지 신뢰도</td><td>0.5 (50%)</td></tr>
                <tr><td>추적 신뢰도</td><td>0.5 (50%)</td></tr>
                <tr><td>키포인트 수</td><td>21개 × 3좌표 = 63 features</td></tr>
                <tr><td>실행 환경</td><td>WebAssembly (브라우저 내)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Keypoint Normalization */}
        <section id="sys-normalization" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">03</span>
            키포인트 정규화
          </h2>
          <p className="sys-desc">
            MediaPipe에서 추출한 랜드마크는 이미지 좌표계(0~1)로 표현됩니다.
            손의 크기, 위치, 카메라 거리에 관계없이 일관된 특징을 추출하기 위해
            손목(Wrist, Landmark 0) 기준 상대 좌표로 변환합니다.
          </p>

          <div className="sys-diagram">
            <div className="norm-flow">
              <div className="norm-step">
                <div className="norm-step-num">1</div>
                <h4>원시 랜드마크 추출</h4>
                <p>MediaPipe → 21개 키포인트 (x, y, z)</p>
                <div className="norm-formula">
                  L = [l₀, l₁, ..., l₂₀] where lᵢ = (xᵢ, yᵢ, zᵢ)
                </div>
              </div>
              <div className="norm-step">
                <div className="norm-step-num">2</div>
                <h4>손목 기준 변환</h4>
                <p>모든 좌표에서 손목(l₀) 좌표를 뺌</p>
                <div className="norm-formula">
                  l'ᵢ = lᵢ − l₀ = (xᵢ − x₀, yᵢ − y₀, zᵢ − z₀)
                </div>
              </div>
              <div className="norm-step">
                <div className="norm-step-num">3</div>
                <h4>1D 벡터 변환</h4>
                <p>21 × 3 = 63차원 특징 벡터로 평탄화</p>
                <div className="norm-formula">
                  F = [x'₀, y'₀, z'₀, x'₁, y'₁, z'₁, ..., x'₂₀, y'₂₀, z'₂₀]
                </div>
              </div>
            </div>
          </div>

          <div className="sys-info-box sys-info-note">
            <h4>정규화의 효과</h4>
            <ul className="sys-list">
              <li><strong>위치 불변성</strong>: 프레임 내 손의 위치에 관계없이 동일한 그립 → 동일한 특징 벡터</li>
              <li><strong>스케일 보존</strong>: 손 크기에 따른 자연스러운 차이는 유지하되, 위치 편향 제거</li>
              <li><strong>실시간 처리</strong>: 단순 뺄셈 연산으로 지연 시간 최소화</li>
            </ul>
          </div>
        </section>

        {/* 4. Autoencoder Model */}
        <section id="sys-autoencoder" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">04</span>
            오토인코더 모델
          </h2>
          <p className="sys-desc">
            올바른 그립 데이터만으로 학습된 오토인코더(Autoencoder)를 사용합니다.
            정상 그립의 패턴을 학습한 모델은 비정상 그립 입력 시 높은 재구성 오차(MSE)를
            발생시켜, 이진 분류를 수행합니다.
          </p>

          <div className="sys-diagram">
            <div className="ae-architecture">
              <div className="ae-section ae-encoder">
                <h4>Encoder</h4>
                <div className="ae-layers">
                  <div className="ae-layer ae-input-layer">
                    <span className="ae-layer-name">Input</span>
                    <span className="ae-layer-size">63</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-hidden-layer">
                    <span className="ae-layer-name">Linear + ReLU</span>
                    <span className="ae-layer-size">32</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-dropout">
                    <span className="ae-layer-name">Dropout</span>
                    <span className="ae-layer-size">p=0.2</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-latent-layer">
                    <span className="ae-layer-name">Latent</span>
                    <span className="ae-layer-size">16</span>
                  </div>
                </div>
              </div>

              <div className="ae-section ae-decoder">
                <h4>Decoder</h4>
                <div className="ae-layers">
                  <div className="ae-layer ae-latent-layer">
                    <span className="ae-layer-name">Latent</span>
                    <span className="ae-layer-size">16</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-hidden-layer">
                    <span className="ae-layer-name">Linear + ReLU</span>
                    <span className="ae-layer-size">32</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-dropout">
                    <span className="ae-layer-name">Dropout</span>
                    <span className="ae-layer-size">p=0.2</span>
                  </div>
                  <div className="ae-arrow">→</div>
                  <div className="ae-layer ae-output-layer">
                    <span className="ae-layer-name">Output</span>
                    <span className="ae-layer-size">63</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>모델 상세</h4>
            <table className="sys-table">
              <tbody>
                <tr><td>모델 유형</td><td>Undercomplete Autoencoder (비대칭 차원 축소)</td></tr>
                <tr><td>학습 데이터</td><td>올바른 그립 영상에서 추출한 정규화 랜드마크</td></tr>
                <tr><td>손실 함수</td><td>Mean Squared Error (MSE)</td></tr>
                <tr><td>활성화 함수</td><td>ReLU (은닉층), None (출력층)</td></tr>
                <tr><td>정규화</td><td>Dropout (p=0.2) — 과적합 방지</td></tr>
                <tr><td>추론 환경</td><td>ONNX Runtime Web (WebAssembly)</td></tr>
                <tr><td>모델 크기</td><td>~15KB (.onnx)</td></tr>
                <tr><td>Bottleneck 비율</td><td>63 → 16 (약 74.6% 차원 축소)</td></tr>
              </tbody>
            </table>
          </div>

          <div className="sys-info-box sys-info-note">
            <h4>원리: 이상 탐지 기반 분류</h4>
            <p style={{ margin: '8px 0', lineHeight: 1.7, fontSize: 13 }}>
              오토인코더는 <strong>정상(올바른 그립) 데이터만</strong>으로 학습됩니다.
              학습 과정에서 모델은 정상 그립의 랜드마크 패턴을 효율적으로 압축하고
              복원하는 방법을 학습합니다. 비정상(잘못된 그립) 입력이 주어지면
              모델이 학습하지 않은 패턴이므로 복원 오차(MSE)가 높아집니다.
              이 MSE 값을 임계값과 비교하여 정상/비정상을 판별합니다.
            </p>
          </div>
        </section>

        {/* 5. MSE Threshold Classification */}
        <section id="sys-threshold" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">05</span>
            MSE 임계값 분류
          </h2>
          <p className="sys-desc">
            오토인코더의 재구성 오차(MSE)를 사전 결정된 임계값과 비교하여
            그립의 정확성을 이진 분류합니다.
          </p>

          <div className="sys-diagram">
            <div className="threshold-visual">
              <div className="threshold-formula-box">
                <h4>분류 공식</h4>
                <div className="threshold-formula">
                  <div className="formula-line">
                    MSE = <span className="formula-frac">1/n</span> Σ(xᵢ − x̂ᵢ)²
                  </div>
                  <div className="formula-line formula-condition">
                    if MSE ≤ τ → <span className="formula-correct">Correct Grip ✓</span>
                  </div>
                  <div className="formula-line formula-condition">
                    if MSE &gt; τ → <span className="formula-incorrect">Incorrect Grip ✗</span>
                  </div>
                  <div className="formula-line formula-tau">
                    τ (threshold) = <strong>0.00729</strong>
                  </div>
                </div>
              </div>

              <div className="threshold-bar-chart">
                <h4>MSE 분포 (개념도)</h4>
                <div className="bar-chart-visual">
                  <div className="bar-region correct-region">
                    <div className="bar-fill" style={{ height: '70%' }} />
                    <span className="bar-label">올바른 그립</span>
                    <span className="bar-sublabel">MSE ≤ 0.00729</span>
                  </div>
                  <div className="threshold-line-visual">
                    <span>τ = 0.00729</span>
                  </div>
                  <div className="bar-region incorrect-region">
                    <div className="bar-fill" style={{ height: '85%' }} />
                    <span className="bar-label">잘못된 그립</span>
                    <span className="bar-sublabel">MSE &gt; 0.00729</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>임계값 결정 및 성능</h4>
            <table className="sys-table">
              <tbody>
                <tr><td>임계값 (τ)</td><td>0.00729</td></tr>
                <tr><td>결정 방법</td><td>검증 데이터셋의 MSE 분포 분석 (95th percentile)</td></tr>
                <tr><td>Validation Coverage</td><td>94.8%</td></tr>
                <tr><td>Test Coverage</td><td>95.0%</td></tr>
                <tr><td>의미</td><td>올바른 그립 샘플의 약 95%가 임계값 이하의 MSE를 가짐</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Modified Pen Grasp */}
        <section id="sys-grip" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">06</span>
            Modified Pen Grasp
          </h2>
          <p className="sys-desc">
            Modified Pen Grasp는 치과 기구를 다루는 표준적인 파지법입니다.
            펜을 잡는 자세와 유사하지만, 기구의 정밀한 조작을 위해 약간 변형된 형태를 취합니다.
            이 파지법은 시술 시 손의 피로를 줄이고 정밀한 힘 조절을 가능하게 합니다.
          </p>

          <div className="sys-diagram">
            <div className="grip-anatomy">
              <div className="grip-card">
                <div className="grip-card-header correct-header">올바른 그립 요소</div>
                <div className="grip-card-body">
                  <div className="grip-point">
                    <span className="grip-point-num" style={{ background: '#E57373' }}>1</span>
                    <div>
                      <strong>엄지 (Thumb)</strong>
                      <p>기구의 한쪽 면을 안정적으로 지지, 끝마디 패드로 접촉</p>
                    </div>
                  </div>
                  <div className="grip-point">
                    <span className="grip-point-num" style={{ background: '#64B5F6' }}>2</span>
                    <div>
                      <strong>검지 (Index)</strong>
                      <p>엄지와 마주보며 기구를 잡음, 삼각형 구조의 한 꼭짓점</p>
                    </div>
                  </div>
                  <div className="grip-point">
                    <span className="grip-point-num" style={{ background: '#81C784' }}>3</span>
                    <div>
                      <strong>중지 (Middle)</strong>
                      <p>기구 아래쪽을 지지, 엄지-검지와 함께 삼각형 구조 형성</p>
                    </div>
                  </div>
                  <div className="grip-point">
                    <span className="grip-point-num" style={{ background: '#FFB74D' }}>4</span>
                    <div>
                      <strong>약지 (Ring)</strong>
                      <p>지지점(Fulcrum) 역할, 환자 구강 내 고정점 제공</p>
                    </div>
                  </div>
                  <div className="grip-point">
                    <span className="grip-point-num" style={{ background: '#BA68C8' }}>5</span>
                    <div>
                      <strong>소지 (Pinky)</strong>
                      <p>약지와 함께 안정성 보조, 자연스러운 위치 유지</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grip-card">
                <div className="grip-card-header key-header">핵심 구조</div>
                <div className="grip-card-body">
                  <svg className="grip-triangle-svg" viewBox="0 0 200 160" fill="none">
                    <polygon points="100,20 40,130 160,130" fill="rgba(77,182,172,0.1)" stroke="#4DB6AC" strokeWidth="2"/>
                    <circle cx="100" cy="20" r="8" fill="#E57373"/>
                    <text x="100" y="16" textAnchor="middle" className="grip-svg-label" fontSize="10">엄지</text>
                    <circle cx="40" cy="130" r="8" fill="#64B5F6"/>
                    <text x="40" y="148" textAnchor="middle" className="grip-svg-label" fontSize="10">검지</text>
                    <circle cx="160" cy="130" r="8" fill="#81C784"/>
                    <text x="160" y="148" textAnchor="middle" className="grip-svg-label" fontSize="10">중지</text>
                    <text x="100" y="85" textAnchor="middle" className="grip-svg-label" fontSize="11" fill="#00796B">삼각형 구조</text>
                  </svg>
                  <p className="grip-key-desc">
                    엄지-검지-중지가 형성하는 <strong>삼각형 구조</strong>가
                    Modified Pen Grasp의 핵심입니다. 이 세 손가락이
                    기구를 안정적으로 파지하며, 약지는 환자의 구강 내에서
                    <strong>지지점(Fulcrum)</strong>으로 작용합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Real-time Analysis */}
        <section id="sys-realtime" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">07</span>
            실시간 분석 파이프라인
          </h2>
          <p className="sys-desc">
            카메라 프레임을 실시간으로 분석하여 사용자에게 즉각적인
            피드백을 제공합니다. 안정적인 판정을 위해 스무딩 버퍼와
            과반수 투표 방식을 사용합니다.
          </p>

          <div className="sys-diagram">
            <div className="realtime-specs">
              <div className="rt-spec-card">
                <div className="rt-spec-value">15</div>
                <div className="rt-spec-label">TARGET_FPS</div>
                <p>초당 분석 프레임 수 (약 67ms 간격)</p>
              </div>
              <div className="rt-spec-card">
                <div className="rt-spec-value">5</div>
                <div className="rt-spec-label">SMOOTHING_BUFFER</div>
                <p>판정 안정화용 프레임 버퍼 크기</p>
              </div>
              <div className="rt-spec-card">
                <div className="rt-spec-value">3/5</div>
                <div className="rt-spec-label">MAJORITY_VOTE</div>
                <p>과반수 투표 기준 (5프레임 중 3프레임)</p>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>분석 프로세스 (매 프레임)</h4>
            <div className="rt-process">
              <div className="rt-step">
                <span className="rt-step-badge">Step 1</span>
                <span>카메라 프레임 캡처 (requestAnimationFrame)</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 2</span>
                <span>MediaPipe로 손 랜드마크 감지</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 3</span>
                <span>랜드마크 정규화 (손목 기준 상대 좌표)</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 4</span>
                <span>ONNX 오토인코더로 재구성 → MSE 계산</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 5</span>
                <span>MSE vs 임계값 비교 → 개별 프레임 판정</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 6</span>
                <span>5프레임 버퍼에 추가 → 과반수 투표 → 최종 판정</span>
              </div>
              <div className="rt-step">
                <span className="rt-step-badge">Step 7</span>
                <span>UI 업데이트 (그립 인디케이터, 오버레이 색상)</span>
              </div>
            </div>
          </div>

          <div className="sys-info-box sys-info-note">
            <h4>스무딩의 필요성</h4>
            <p style={{ margin: '8px 0', lineHeight: 1.7, fontSize: 13 }}>
              단일 프레임 기반 판정은 MediaPipe의 일시적 랜드마크 오차나
              손의 미세한 움직임으로 인해 결과가 불안정할 수 있습니다.
              5프레임 이동 윈도우에서 과반수 투표를 통해 <strong>노이즈를 제거</strong>하고
              사용자에게 안정적인 시각적 피드백을 제공합니다.
            </p>
          </div>
        </section>

        {/* 8. Data Collection */}
        <section id="sys-data" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">08</span>
            데이터 수집 및 학습
          </h2>
          <p className="sys-desc">
            오토인코더 학습에 사용되는 데이터는 올바른 그립 영상에서 추출됩니다.
            데이터 수집부터 모델 학습까지의 전체 파이프라인을 설명합니다.
          </p>

          <div className="sys-diagram">
            <div className="data-pipeline">
              <div className="data-step">
                <div className="data-step-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="4" y="8" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M13 28L23 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>영상 촬영</h4>
                <p>치과 전문가의 올바른 그립 시연을 다양한 각도에서 촬영</p>
              </div>
              <div className="data-arrow">→</div>
              <div className="data-step">
                <div className="data-step-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="22" cy="10" r="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="10" cy="22" r="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="18" cy="20" r="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="26" cy="18" r="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="14" cy="28" r="3" fill="currentColor" opacity="0.6"/>
                  </svg>
                </div>
                <h4>랜드마크 추출</h4>
                <p>MediaPipe로 프레임별 21개 키포인트 추출</p>
              </div>
              <div className="data-arrow">→</div>
              <div className="data-step">
                <div className="data-step-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M8 10H28M8 18H28M8 26H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 6V30M22 6V30" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  </svg>
                </div>
                <h4>정규화 + CSV</h4>
                <p>손목 기준 정규화 후 63차원 벡터로 CSV 저장</p>
              </div>
              <div className="data-arrow">→</div>
              <div className="data-step">
                <div className="data-step-icon">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M6 18H12L16 10L20 26L24 16L28 20H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>모델 학습</h4>
                <p>PyTorch로 오토인코더 학습 → ONNX 변환</p>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>학습 프로세스</h4>
            <table className="sys-table">
              <tbody>
                <tr><td>학습 프레임워크</td><td>PyTorch</td></tr>
                <tr><td>학습 데이터</td><td>올바른 그립 랜드마크 (정규화 완료)</td></tr>
                <tr><td>데이터 분할</td><td>Train / Validation / Test</td></tr>
                <tr><td>손실 함수</td><td>MSE Loss</td></tr>
                <tr><td>옵티마이저</td><td>Adam</td></tr>
                <tr><td>모델 변환</td><td>PyTorch → ONNX (torch.onnx.export)</td></tr>
                <tr><td>추론 엔진</td><td>ONNX Runtime Web (ort-wasm)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. Evaluation Metrics */}
        <section id="sys-evaluation" className="sys-section">
          <h2 className="sys-section-title">
            <span className="sys-num">09</span>
            평가 지표
          </h2>
          <p className="sys-desc">
            모델과 시스템의 성능을 다양한 지표로 평가합니다.
            오토인코더 기반 이상 탐지 시스템의 특성상, Coverage Rate와
            MSE 분포 분석이 핵심 평가 방법입니다.
          </p>

          <div className="sys-diagram">
            <div className="eval-metrics">
              <div className="eval-card">
                <h4>Coverage Rate</h4>
                <div className="eval-value">95.0%</div>
                <p>
                  테스트 데이터에서 올바른 그립 샘플 중 임계값 이하의
                  MSE를 보인 비율. 모델이 정상 그립을 얼마나 잘 인식하는지를 나타냄.
                </p>
              </div>
              <div className="eval-card">
                <h4>Reconstruction Error</h4>
                <div className="eval-value">MSE</div>
                <p>
                  입력과 출력 간의 평균 제곱 오차. 올바른 그립은 낮은 MSE,
                  잘못된 그립은 높은 MSE를 보이는 것이 이상적.
                </p>
              </div>
              <div className="eval-card">
                <h4>Session Accuracy</h4>
                <div className="eval-value">Per-session</div>
                <p>
                  실습 세션 중 올바른 그립으로 판정된 프레임의 비율.
                  사용자의 실시간 실습 성과를 측정.
                </p>
              </div>
            </div>
          </div>

          <div className="sys-info-box">
            <h4>평가 방법론</h4>
            <table className="sys-table">
              <tbody>
                <tr><td>Validation Coverage</td><td>94.8% (검증 데이터셋)</td></tr>
                <tr><td>Test Coverage</td><td>95.0% (테스트 데이터셋)</td></tr>
                <tr><td>임계값 결정</td><td>검증셋 MSE의 95th percentile</td></tr>
                <tr><td>세션 정확도</td><td>correctFrames / totalFrames × 100%</td></tr>
                <tr><td>주간 목표</td><td>3일 이상 연습 달성 여부</td></tr>
              </tbody>
            </table>
          </div>

          <div className="sys-info-box sys-info-note">
            <h4>시스템 한계점 및 향후 과제</h4>
            <ul className="sys-list">
              <li><strong>단일 클래스 학습</strong>: 올바른 그립만으로 학습하므로, 다양한 유형의 잘못된 그립을 세분화하여 피드백하기 어려움</li>
              <li><strong>조명 의존성</strong>: MediaPipe의 손 감지 성능은 조명 조건에 영향받을 수 있음</li>
              <li><strong>기구 인식 부재</strong>: 현재 손만 감지하며, 기구의 종류나 위치는 분석하지 않음</li>
              <li><strong>확장 가능성</strong>: 추가 기구(Curette 등)에 대한 그립 모델 학습으로 시스템 확장 가능</li>
            </ul>
          </div>
        </section>

        <div className="sys-footer">
          <p>GraspFit — AI 기반 치과 기구 파지법 교육 시스템</p>
          <p className="sys-footer-sub">본 문서는 시스템의 기술적 원리를 설명하기 위한 참고 자료입니다.</p>
        </div>
      </div>
    </div>
  );
}
