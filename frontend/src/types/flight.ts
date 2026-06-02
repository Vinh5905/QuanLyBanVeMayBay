export interface SanBayResponse {
  maSanBay: string;
  tenSanBay: string;
  thanhPho: string;
  quocGia: string;
}

export interface HangVeInfo {
  maHangVe: number;
  tenHangVe: string;
  soLuong: number;
  soGheDaDat: number;
  soGheCon: number;
  donGia: number;
}

export interface TrungGianInfo {
  maSanBay: string;
  tenSanBay: string;
  thanhPho: string;
  thuTu: number;
  thoiGianDung: number;
  ghiChu?: string;
}

export interface FlightResponse {
  id?: number;
  maChuyenBay: number;
  maChuyenBayCode: string;
  sanBayDi: SanBayResponse;
  sanBayDen: SanBayResponse;
  ngayGioBay: string;
  thoiGianBay: number;
  giaCoBan: number;
  trangThaiChuyenBay: string;
  danhSachHangVe: HangVeInfo[];
  danhSachTrungGian: TrungGianInfo[];
  createdAt: string;
}

export interface FlightSearchRequest {
  sanBayDi?: string;
  sanBayDen?: string;
  ngayBay?: string;
  trangThai?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface HangVeInput {
  maHangVe: number;
  soLuong: number;
  donGia: number;
}

export interface TrungGianInput {
  maSanBay: string;
  thuTu: number;
  thoiGianDung: number;
  ghiChu?: string;
}

export interface CreateFlightRequest {
  maChuyenBayCode: string;
  sanBayDi: string;
  sanBayDen: string;
  ngayGioBay: string;
  thoiGianBay: number;
  giaCoBan: number;
  danhSachHangVe: HangVeInput[];
  danhSachTrungGian?: TrungGianInput[];
}

export interface UpdateFlightRequest {
  ngayGioBay?: string;
  thoiGianBay?: number;
  giaCoBan?: number;
  danhSachHangVe?: HangVeInput[];
  danhSachTrungGian?: TrungGianInput[];
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T[];
  pagination: PaginationInfo;
}

export interface ApiSingleResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
