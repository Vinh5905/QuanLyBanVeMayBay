export interface PaymentRequest {
  maPhieuDatCho?: number;
  maVe?: number;
  hinhThucThanhToan: string;
  soTienThanhToan: number;
  maGiaoDich?: string;
}

export interface PaymentResponse {
  maThanhToan: number;
  maVe: number | null;
  maPhieuDatCho: number | null;
  soTien: number;
  thueVAT: number;
  phuongThuc: string;
  trangThaiThanhToan: string;
  maGiaoDich: string;
  thoiGianThanhToan: string;
  createdAt: string;
}

export interface PaymentSearchParams {
  maVe?: number;
  trangThai?: string;
  page?: number;
  size?: number;
  sort?: string;
}
