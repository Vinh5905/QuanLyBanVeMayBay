// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserInfo {
  maTaiKhoan: number
  tenDangNhap: string
  email: string
  vaiTro: 'Admin' | 'NhanVien' | 'DaiLy' | 'KhachHang'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userInfo: UserInfo
}

// ── Airport ───────────────────────────────────────────────────────────────────
export interface Airport {
  maSanBay: string
  tenSanBay: string
  thanhPho: string
  quocGia?: string
}

// ── Flight ────────────────────────────────────────────────────────────────────
export interface SeatClass {
  maHangVe: number
  tenHangVe: string
  soLuong: number
  soGheDaDat: number
  soGheCon: number
  donGia: number
}

export interface Stopover {
  maTrungGian?: number
  maSanBay: string
  tenSanBay?: string
  thoiGianDung: number
  ghiChu?: string
}

export interface Flight {
  maChuyenBay: number
  maChuyenBayCode: string
  sanBayDi: Airport
  sanBayDen: Airport
  ngayGioBay: string
  thoiGianBay: number
  giaCoBan: number
  trangThaiChuyenBay: string
  danhSachHangVe: SeatClass[]
  danhSachTrungGian: Stopover[]
  createdAt?: string
}

// ── Ticket ────────────────────────────────────────────────────────────────────
export type TicketStatus = 'HOP_LE' | 'DANG_GIU_CHO' | 'DA_HUY' | 'DA_DOI'

export interface TicketCustomer {
  maKhachHang: number
  hoTen: string
  email?: string
  soDienThoai?: string
  cccd?: string
}

export interface TicketFlight {
  maChuyenBay: number
  maChuyenBayCode: string
  sanBayDi: string
  tenSanBayDi: string
  sanBayDen: string
  tenSanBayDen: string
  ngayGioBay: string
}

export interface TicketClass {
  maHangVe: number
  tenHangVe: string
  donGia: number
}

export interface Ticket {
  maVe: number
  maVeCode: string
  chuyenBay: TicketFlight
  hangVe: TicketClass
  khachHang: TicketCustomer
  giaVe: number
  trangThaiVe: TicketStatus
  maPhieuDatCho?: number | null
  createdAt: string
}

// ── Booking ───────────────────────────────────────────────────────────────────
export interface Booking {
  maPhieuDatCho: number
  ve: Ticket
  tongTien: number
  trangThaiDatCho: string
  hanThanhToan: string
  createdAt: string
}

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'CARD' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER'

export interface Payment {
  maThanhToan: number
  maVe?: number
  maPhieuDatCho?: number
  soTien: number
  thueVAT: number
  phuongThuc: PaymentMethod
  trangThaiThanhToan: string
  maGiaoDich?: string
  thoiGianThanhToan: string
  createdAt: string
}

// ── Baggage ───────────────────────────────────────────────────────────────────
export interface BaggagePricing {
  maBangGia: number
  tenGoi: string
  trongLuongToiDa: number
  giaMuaTruoc: number
  giaTaiSanBay: number
}

export interface BaggageItem {
  maKienHanhLy: number
  maTheHanhLy: string
  trongLuong: number
  ghiChu?: string
}

export interface BaggagePackage {
  maGoiHanhLy: number
  maVe: number
  bangGia: BaggagePricing
  tongTrongLuong: number
  tongPhi: number
  trangThai: string
  daThanhToan: boolean
  danhSachKien: BaggageItem[]
  createdAt: string
}

// ── Check-in ──────────────────────────────────────────────────────────────────
export interface BoardingPass {
  maCheckIn: number
  boardingPassCode: string
  soGhe: string
  trangThai: string
  checkInAt: string
  ve: {
    maVe: number
    maVeCode: string
    trangThaiVe: TicketStatus
    hangVe: string
  }
  hanhKhach: {
    hoTen: string
    cccd: string
    email: string
  }
  chuyenBay: {
    maChuyenBayCode: string
    sanBayDi: string
    tenSanBayDi: string
    sanBayDen: string
    tenSanBayDen: string
    ngayGioBay: string
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  tongVeHomNay: number
  doanhThuHomNay: number
  soChuyenBayHomNay: number
  soKhachMoiThangNay: number
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface MonthlyReportRow {
  maChuyenBay: number
  maChuyenBayCode: string
  sanBayDi: string
  sanBayDen: string
  ngayGioBay: string
  doanhThuVe: number
  doanhThuHanhLy: number
  soVeBan: number
  phanTramTrenTong: number
}

export interface YearlyReportRow {
  thang: number
  soChuyenBay: number
  soVe: number
  doanhThu: number
  phanTram: number
}

// ── Account ───────────────────────────────────────────────────────────────────
export interface Account {
  maTaiKhoan: number
  tenDangNhap: string
  email: string
  vaiTro: string
  maVaiTro: number
  maKhachHang?: number | null
  trangThai: number
  createdAt: string
  lastLogin?: string
}

// ── Config ────────────────────────────────────────────────────────────────────
export interface ConfigParam {
  tenThamSo: string
  giaTri: string
  moTa?: string
  capNhatLuc?: string
  capNhatBoi?: number
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface Pagination {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  code: number
  message?: string
  data?: T
  pagination?: Pagination
  errors?: { field: string; message: string }[]
  timestamp?: string
  requestId?: string
}
