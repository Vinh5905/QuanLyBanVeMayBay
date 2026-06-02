export interface TicketResponse {
  maVe: number;
  maVeCode: string;
  chuyenBay: FlightInfo;
  hangVe: ClassInfo;
  khachHang: CustomerInfo;
  giaVe: number;
  trangThaiVe: string;
  maPhieuDatCho: number | null;
  createdAt: string;
}

export interface BookingResponse {
  maPhieuDatCho: number;
  ve: TicketResponse | null;
  tongTien: number;
  trangThaiDatCho: string;
  hanThanhToan: string;
  createdAt: string;
}

export interface FlightInfo {
  maChuyenBay: number;
  maChuyenBayCode: string;
  sanBayDi: string;
  sanBayDen: string;
  ngayGioBay: string;
  thoiGianBay: number;
}

export interface ClassInfo {
  maHangVe: number;
  tenHangVe: string;
  heSoGia: number;
}

export interface CustomerInfo {
  maKhachHang: number;
  hoTen: string;
  cccd: string;
  email: string;
  soDienThoai: string;
}

export interface SellTicketRequest {
  maChuyenBay: number;
  maKhachHang: number;
  maHangVe: number;
}

export interface BookTicketRequest {
  maChuyenBay: number;
  maHangVe: number;
}

export interface ChangeFlightRequest {
  maChuyenBayMoi: number;
}

export interface UpgradeRequest {
  maHangVeMoi: number;
}

export interface TicketSearchParams {
  maKhachHang?: number;
  maChuyenBay?: number;
  trangThaiVe?: string;
  page?: number;
  size?: number;
  sort?: string;
}
