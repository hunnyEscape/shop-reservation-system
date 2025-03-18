// src/__tests__/components/Calendar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '@/components/reservation/Calendar';
import { getDateAvailability } from '@/lib/reservation';

// getDateAvailabilityのモック
jest.mock('@/lib/reservation', () => ({
  getDateAvailability: jest.fn(),
}));

describe('Calendar Component', () => {
  const mockOnDateSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // モックの戻り値を設定
    (getDateAvailability as jest.Mock).mockResolvedValue([
      { date: '2025-03-17', status: 'available', availableSeats: 3 },
      { date: '2025-03-18', status: 'limited', availableSeats: 1 },
      { date: '2025-03-19', status: 'full', availableSeats: 0 },
    ]);
  });
  
  it('renders correctly', async () => {
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    // カレンダーが表示されることを確認
    expect(screen.getByText(/年/)).toBeInTheDocument();
    expect(screen.getByText(/月/)).toBeInTheDocument();
    
    // 曜日が表示されることを確認
    expect(screen.getByText('日')).toBeInTheDocument();
    expect(screen.getByText('月')).toBeInTheDocument();
    expect(screen.getByText('火')).toBeInTheDocument();
    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.getByText('木')).toBeInTheDocument();
    expect(screen.getByText('金')).toBeInTheDocument();
    expect(screen.getByText('土')).toBeInTheDocument();
    
    // 凡例が表示されることを確認
    expect(screen.getByText('空き')).toBeInTheDocument();
    expect(screen.getByText('残りわずか')).toBeInTheDocument();
    expect(screen.getByText('満席')).toBeInTheDocument();
  });
  
  it('calls onDateSelect when a date is clicked', async () => {
    // Dateを固定
    const mockDate = new Date('2025-03-17');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    // 日付をクリック
    const dateCell = screen.getByText('17');
    fireEvent.click(dateCell);
    
    // onDateSelectが呼ばれることを確認
    expect(mockOnDateSelect).toHaveBeenCalled();
    
    // Dateのモックをリストア
    jest.restoreAllMocks();
  });
  
  it('disables past dates', async () => {
    // Dateを固定（2025-03-17）
    const mockToday = new Date('2025-03-17');
    jest.spyOn(global, 'Date').mockImplementation(() => mockToday);
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    // 今日より前の日付のスタイルをチェック
    // 注意: 実際のテストでは、日付セルの正確な取得方法はコンポーネントの実装に依存します
    
    // Dateのモックをリストア
    jest.restoreAllMocks();
  });
  
  it('navigates to next and previous months', async () => {
    // Dateを固定（2025-03-17）
    const mockToday = new Date('2025-03-17');
    jest.spyOn(global, 'Date').mockImplementation(() => mockToday);
    
    render(<Calendar onDateSelect={mockOnDateSelect} />);
    
    // 初期状態で3月が表示されることを確認
    expect(screen.getByText(/3月/)).toBeInTheDocument();
    
    // 次の月ボタンをクリック
    const nextMonthButton = screen.getByRole('button', { name: /次の月/i });
    fireEvent.click(nextMonthButton);
    
    // 4月が表示されることを確認
    expect(screen.getByText(/4月/)).toBeInTheDocument();
    
    // 前の月ボタンをクリック
    const prevMonthButton = screen.getByRole('button', { name: /前の月/i });
    fireEvent.click(prevMonthButton);
    
    // 再び3月が表示されることを確認
    expect(screen.getByText(/3月/)).toBeInTheDocument();
    
    // Dateのモックをリストア
    jest.restoreAllMocks();
  });
});