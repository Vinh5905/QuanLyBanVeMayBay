import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAirports } from '../hooks/useAirports';

export interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export const AirportSelect: React.FC<AirportSelectProps> = ({ value, onChange, placeholder, error }) => {
  const { airports } = useAirports();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => airports.find(a => a.maSanBay === value), [airports, value]);

  const filtered = useMemo(() => {
    if (!query) return airports;
    const q = query.toLowerCase();
    return airports.filter(
      a => a.maSanBay.toLowerCase().includes(q)
        || a.tenSanBay.toLowerCase().includes(q)
        || a.thanhPho.toLowerCase().includes(q)
    );
  }, [airports, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (value) onChange('');
    setIsOpen(true);
  };

  const handleSelect = (maSanBay: string) => {
    onChange(maSanBay);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        className={`ds-input ${error ? 'ds-input--error' : ''}`}
        type="text"
        value={selected ? `${selected.tenSanBay} (${selected.maSanBay})` : query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || 'Chọn sân bay...'}
        autoComplete="off"
      />
      {isOpen && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8,
          maxHeight: 240, overflowY: 'auto', listStyle: 'none', margin: '4px 0 0',
          padding: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        }}>
          {filtered.map(a => (
            <li
              key={a.maSanBay}
              onClick={() => handleSelect(a.maSanBay)}
              style={{
                padding: '8px 12px', cursor: 'pointer', borderRadius: 4,
                background: value === a.maSanBay ? '#EFF6FF' : undefined,
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F8FAFC'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = value === a.maSanBay ? '#EFF6FF' : ''; }}
            >
              <div style={{ fontSize: 14, color: '#0F172A' }}>{a.tenSanBay}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>{a.thanhPho} ({a.maSanBay})</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
