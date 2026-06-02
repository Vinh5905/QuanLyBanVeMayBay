export interface CheckInRequest {
  maVe: number;
  soGhe: string;
}

export interface BoardingPassResponse {
  maCheckIn: number;
  boardingPassCode: string;
  soGhe: string;
  trangThai: string;
  checkInAt: string;
  ve: TicketInfo;
  hanhKhach: PassengerInfo;
  chuyenBay: FlightBriefInfo;
}

export interface TicketInfo {
  maVe: number;
  maVeCode: string;
  giaVe: number;
  trangThaiVe: string;
}

export interface PassengerInfo {
  maKhachHang: number;
  hoTen: string;
  cccd: string;
}

export interface FlightBriefInfo {
  maChuyenBay: number;
  maChuyenBayCode: string;
  sanBayDi: string;
  sanBayDen: string;
  ngayGioBay: string;
  thoiGianBay: number;
}
