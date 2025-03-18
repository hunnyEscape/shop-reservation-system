// src/components/reservation/TimeSlotsGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SeatId, TimeSlot } from '@/types';
import { getTimeSlotsForDate, getSeatInfo } from '@/lib/reservation';

interface TimeSlotGridProps {
  date: Date;
  onTimeSlotSelect: (seatId: SeatId, startTime: string, duration: number) => void;
}

export default function TimeSlotsGrid({ date, onTimeSlotSelect }: TimeSlotGridProps) {
  const [timeSlots, setTimeSlots] = useState<{ [key: string]: TimeSlot[] }>({
    A: [],
    B: [],
    C: [],
  });
  const [selectedSeat, setSelectedSeat] = useState<SeatId | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [seatInfo, setSeatInfo] = useState<any>({});

  // 営業時間を定義
  const businessHours = Array.from({ length: 13 }, (_, i) => i + 9).map(hour => 
    `${hour.toString().padStart(2, '0')}:00`
  );

  // タイムスロットデータの取得
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        // 各席のタイムスロットを取得
        const seatIds: SeatId[] = ['A', 'B', 'C'];
        const slotsData: { [key: string]: TimeSlot[] } = { A: [], B: [], C: [] };
        
        for (const seatId of seatIds) {
          slotsData[seatId] = await getTimeSlotsForDate(date, seatId);
          const info = await getSeatInfo(seatId);
          setSeatInfo(prev => ({ ...prev, [seatId]: info }));
        }
        
        setTimeSlots(slotsData);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [date]);

  // 時間枠を選択
  const handleTimeSlotClick = (seatId: SeatId, startTime: string) => {
    if (selectedSeat === seatId && selectedStartTime === startTime) {
      // 同じスロットを選択した場合は選択解除
      setSelectedSeat(null);
      setSelectedStartTime(null);
      setSelectedDuration(1);
    } else {
      setSelectedSeat(seatId);
      setSelectedStartTime(startTime);
      setSelectedDuration(1);
    }
  };

  // 予約時間を変更
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDuration(parseInt(e.target.value));
  };

  // 予約確定
  const handleConfirm = () => {
    if (selectedSeat && selectedStartTime) {
      onTimeSlotSelect(selectedSeat, selectedStartTime, selectedDuration);
    }
  };

  // 選択した時間枠が予約可能かチェック
  const isTimeSlotAvailable = (seatId: SeatId, startTimeStr: string) => {
    if (!timeSlots[seatId]) return false;
    
    const startTimeIndex = businessHours.findIndex(t => t === startTimeStr);
    if (startTimeIndex === -1) return false;
    
    // 選択した時間枠から選択した期間分のスロットがすべて空いているかチェック
    for (let i = 0; i < selectedDuration; i++) {
      const timeIndex = startTimeIndex + i;
      if (timeIndex >= businessHours.length) return false;
      
      const timeStr = businessHours[timeIndex];
      const slotId = `${seatId}-${format(date, 'yyyy-MM-dd')}T${timeStr}:00`;
      const slot = timeSlots[seatId].find(s => s.id === slotId);
      
      if (!slot || slot.isReserved || slot.status !== 'available') {
        return false;
      }
    }
    
    return true;
  };

  // 選択した席と時間枠に対して、指定した期間が予約可能かチェック
  const canSelectDuration = (duration: number) => {
    if (!selectedSeat || !selectedStartTime) return false;
    
    const startTimeIndex = businessHours.findIndex(t => t === selectedStartTime);
    if (startTimeIndex === -1) return false;
    
    // 選択した時間枠から指定した期間分のスロットがすべて空いているかチェック
    for (let i = 0; i < duration; i++) {
      const timeIndex = startTimeIndex + i;
      if (timeIndex >= businessHours.length) return false;
      
      const timeStr = businessHours[timeIndex];
      const slotId = `${selectedSeat}-${format(date, 'yyyy-MM-dd')}T${timeStr}:00`;
      const slot = timeSlots[selectedSeat].find(s => s.id === slotId);
      
      if (!slot || slot.isReserved || slot.status !== 'available') {
        return false;
      }
    }
    
    return true;
  };

  // スロットのスタイルを取得
  const getSlotStyle = (seatId: SeatId, startTime: string) => {
    const isAvailable = isTimeSlotAvailable(seatId, startTime);
    const isSelected = selectedSeat === seatId && selectedStartTime === startTime;
    
    let bgColor = 'bg-white';
    let borderColor = 'border-gray-200';
    let textColor = 'text-gray-800';
    
    if (!isAvailable) {
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-400';
    } else if (isSelected) {
      bgColor = 'bg-blue-500';
      borderColor = 'border-blue-600';
      textColor = 'text-white';
    }
    
    return `
      w-full py-2 text-center border ${borderColor} rounded
      ${bgColor} ${textColor}
      ${isAvailable ? 'cursor-pointer hover:bg-blue-100' : 'cursor-not-allowed'}
    `;
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="col-span-1"></div>
              <div className="col-span-1 text-center font-semibold">
                A席 
                <div className="text-sm text-gray-600 font-normal">
                  {seatInfo.A?.description || '個人席'} ({seatInfo.A?.pricePerHour || 1000}円/時間)
                </div>
              </div>
              <div className="col-span-1 text-center font-semibold">
                B席
                <div className="text-sm text-gray-600 font-normal">
                  {seatInfo.B?.description || 'ミーティング席'} ({seatInfo.B?.pricePerHour || 1500}円/時間)
                </div>
              </div>
              <div className="col-span-1 text-center font-semibold">
                C席
                <div className="text-sm text-gray-600 font-normal">
                  {seatInfo.C?.description || '大人数席'} ({seatInfo.C?.pricePerHour || 2000}円/時間)
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {businessHours.map((time) => (
                <div key={time} className="grid grid-cols-4 gap-2 mb-2">
                  <div className="col-span-1 flex items-center justify-end font-medium">
                    {time}
                  </div>
                  <div className="col-span-1">
                    <button
                      className={getSlotStyle('A', time)}
                      onClick={() => handleTimeSlotClick('A', time)}
                      disabled={!isTimeSlotAvailable('A', time)}
                    >
                      {isTimeSlotAvailable('A', time) ? '空き' : '予約済'}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      className={getSlotStyle('B', time)}
                      onClick={() => handleTimeSlotClick('B', time)}
                      disabled={!isTimeSlotAvailable('B', time)}
                    >
                      {isTimeSlotAvailable('B', time) ? '空き' : '予約済'}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      className={getSlotStyle('C', time)}
                      onClick={() => handleTimeSlotClick('C', time)}
                      disabled={!isTimeSlotAvailable('C', time)}
                    >
                      {isTimeSlotAvailable('C', time) ? '空き' : '予約済'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedSeat && selectedStartTime && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">予約詳細</h3>
              <div className="mb-4">
                <p><span className="font-medium">席:</span> {selectedSeat}席</p>
                <p><span className="font-medium">日付:</span> {format(date, 'yyyy年MM月dd日')}</p>
                <p><span className="font-medium">開始時間:</span> {selectedStartTime}</p>
                <div className="mt-2">
                  <label htmlFor="duration" className="font-medium">
                    予約時間:
                  </label>
                  <select
                    id="duration"
                    value={selectedDuration}
                    onChange={handleDurationChange}
                    className="ml-2 p-1 border rounded"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                      <option
                        key={hours}
                        value={hours}
                        disabled={!canSelectDuration(hours)}
                      >
                        {hours}時間
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2">
                  <span className="font-medium">料金:</span> {(seatInfo[selectedSeat]?.pricePerHour || 0) * selectedDuration}円
                </p>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                この席を予約する
              </button>
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white border rounded-full mr-1"></div>
                <span>空き</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border rounded-full mr-1"></div>
                <span>予約済み</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded-full mr-1"></div>
                <span>選択中</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}