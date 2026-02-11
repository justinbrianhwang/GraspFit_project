import './GripIndicator.css';

interface Props {
  isCorrect: boolean | null;
  confidence: number;
  handDetected: boolean;
  mse?: number;
  threshold?: number;
}

export default function GripIndicator({ isCorrect, confidence, handDetected, mse, threshold }: Props) {
  if (!handDetected) {
    return (
      <div className="grip-indicator no-hand">
        <div className="indicator-dot" />
        <span>손이 감지되지 않았습니다</span>
      </div>
    );
  }

  return (
    <div className={`grip-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="indicator-dot" />
      <div className="indicator-info">
        <span className="indicator-label">
          {isCorrect ? '올바른 그립' : '그립을 교정해주세요'}
        </span>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
        {mse !== undefined && threshold !== undefined && (
          <span className="indicator-mse">
            오차: {mse.toFixed(4)} / {threshold.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
}
