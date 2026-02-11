import { Timer } from 'lucide-react';
import './PracticeTimer.css';

interface Props {
  time: string;
  correctRate: number;
  isActive: boolean;
}

export default function PracticeTimer({ time, correctRate, isActive }: Props) {
  return (
    <div className={`practice-timer ${isActive ? 'active' : ''}`}>
      <Timer size={18} />
      <span className="timer-time">{time}</span>
      <span className="timer-divider">|</span>
      <span className="timer-rate">정확도 {correctRate}%</span>
    </div>
  );
}
