import { useState, useEffect, useCallback } from 'react';
import { flightApi } from '../../../api/flightApi';
import type { FlightResponse, HangVeInput, TrungGianInput } from '../../../types/flight';

export interface FlightFormState {
  maChuyenBayCode: string;
  sanBayDi: string;
  sanBayDen: string;
  ngayGioBay: string;
  thoiGianBay: string;
  giaCoBan: string;
  danhSachHangVe: HangVeInput[];
  danhSachTrungGian: TrungGianInput[];
}

export interface FormErrors {
  [key: string]: string;
}

const initialFormState: FlightFormState = {
  maChuyenBayCode: '',
  sanBayDi: '',
  sanBayDen: '',
  ngayGioBay: '',
  thoiGianBay: '',
  giaCoBan: '',
  danhSachHangVe: [],
  danhSachTrungGian: [],
};

function validateForm(state: FlightFormState): FormErrors {
  const errors: FormErrors = {};
  if (!state.maChuyenBayCode.trim()) errors.maChuyenBayCode = 'Mã chuyến bay không được để trống';
  if (!state.sanBayDi) errors.sanBayDi = 'Vui lòng chọn sân bay đi';
  if (!state.sanBayDen) errors.sanBayDen = 'Vui lòng chọn sân bay đến';
  if (state.sanBayDi && state.sanBayDen && state.sanBayDi === state.sanBayDen) {
    errors.sanBayDen = 'Sân bay đến phải khác sân bay đi';
  }
  if (!state.ngayGioBay) errors.ngayGioBay = 'Vui lòng chọn ngày giờ bay';
  if (!state.thoiGianBay || Number(state.thoiGianBay) < 30) errors.thoiGianBay = 'Thời gian bay tối thiểu 30 phút';
  if (!state.giaCoBan || Number(state.giaCoBan) <= 0) errors.giaCoBan = 'Giá cơ bản phải lớn hơn 0';
  if (state.danhSachHangVe.length === 0) errors.danhSachHangVe = 'Phải có ít nhất 1 hạng vé';
  if (state.danhSachTrungGian.length > 2) errors.danhSachTrungGian = 'Tối đa 2 sân bay trung gian';
  return errors;
}

export function useFlightForm(flightId?: number) {
  const [formState, setFormState] = useState<FlightFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEditMode] = useState(!!flightId);

  useEffect(() => {
    if (!flightId) return;
    let cancelled = false;
    setIsLoading(true);
    flightApi.getFlightById(flightId)
      .then(res => {
        if (cancelled || res.data.status !== 'success') return;
        const f: FlightResponse = res.data.data;
        setFormState({
          maChuyenBayCode: f.maChuyenBayCode,
          sanBayDi: f.sanBayDi.maSanBay,
          sanBayDen: f.sanBayDen.maSanBay,
          ngayGioBay: f.ngayGioBay.slice(0, 16),
          thoiGianBay: String(f.thoiGianBay),
          giaCoBan: String(f.giaCoBan),
          danhSachHangVe: f.danhSachHangVe.map(h => ({ maHangVe: h.maHangVe, soLuong: h.soLuong, donGia: h.donGia })),
          danhSachTrungGian: f.danhSachTrungGian.map(t => ({ maSanBay: t.maSanBay, thuTu: t.thuTu, thoiGianDung: t.thoiGianDung, ghiChu: t.ghiChu })),
        });
      })
      .catch(() => setServerError('Không thể tải thông tin chuyến bay'))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [flightId]);

  const setField = useCallback(<K extends keyof FlightFormState>(key: K, value: FlightFormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    setServerError(null);
  }, []);

  const addHangVe = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      danhSachHangVe: [...prev.danhSachHangVe, { maHangVe: prev.danhSachHangVe.length + 1, soLuong: 0, donGia: 0 }],
    }));
  }, []);

  const removeHangVe = useCallback((index: number) => {
    setFormState(prev => ({
      ...prev,
      danhSachHangVe: prev.danhSachHangVe.filter((_, i) => i !== index),
    }));
  }, []);

  const updateHangVe = useCallback((index: number, field: keyof HangVeInput, value: number) => {
    setFormState(prev => {
      const list = [...prev.danhSachHangVe];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, danhSachHangVe: list };
    });
  }, []);

  const addTrungGian = useCallback(() => {
    if (formState.danhSachTrungGian.length >= 2) return;
    setFormState(prev => ({
      ...prev,
      danhSachTrungGian: [...prev.danhSachTrungGian, { maSanBay: '', thuTu: prev.danhSachTrungGian.length + 1, thoiGianDung: 45, ghiChu: '' }],
    }));
  }, [formState.danhSachTrungGian.length]);

  const removeTrungGian = useCallback((index: number) => {
    setFormState(prev => ({
      ...prev,
      danhSachTrungGian: prev.danhSachTrungGian.filter((_, i) => i !== index),
    }));
  }, []);

  const updateTrungGian = useCallback((index: number, field: keyof TrungGianInput, value: any) => {
    setFormState(prev => {
      const list = [...prev.danhSachTrungGian];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, danhSachTrungGian: list };
    });
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateForm(formState);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return false;

    setIsSubmitting(true);
    setServerError(null);
    try {
      if (isEditMode && flightId) {
        await flightApi.updateFlight(flightId, {
          ngayGioBay: formState.ngayGioBay + ':00',
          thoiGianBay: Number(formState.thoiGianBay),
          giaCoBan: Number(formState.giaCoBan),
          danhSachTrungGian: formState.danhSachTrungGian.length > 0 ? formState.danhSachTrungGian : undefined,
        });
      } else {
        await flightApi.createFlight({
          maChuyenBayCode: formState.maChuyenBayCode,
          sanBayDi: formState.sanBayDi,
          sanBayDen: formState.sanBayDen,
          ngayGioBay: formState.ngayGioBay + ':00',
          thoiGianBay: Number(formState.thoiGianBay),
          giaCoBan: Number(formState.giaCoBan),
          danhSachHangVe: formState.danhSachHangVe,
          danhSachTrungGian: formState.danhSachTrungGian.length > 0 ? formState.danhSachTrungGian : undefined,
        });
      }
      return true;
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        const mapped: FormErrors = {};
        serverErrors.forEach((e: { field: string; message: string }) => { mapped[e.field] = e.message; });
        setErrors(mapped);
      }
      setServerError(err.response?.data?.message || err.message || 'Lỗi khi lưu chuyến bay');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, isEditMode, flightId]);

  const reset = useCallback(() => {
    setFormState(initialFormState);
    setErrors({});
    setServerError(null);
  }, []);

  return {
    formState, errors, isSubmitting, isLoading, serverError, isEditMode,
    setField, addHangVe, removeHangVe, updateHangVe,
    addTrungGian, removeTrungGian, updateTrungGian,
    submit, reset,
  };
}
