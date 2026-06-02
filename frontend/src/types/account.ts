export interface AccountResponse {
  maTaiKhoan: number;
  tenDangNhap: string;
  email: string;
  vaiTro: string;
  maVaiTro: number;
  maKhachHang: number | null;
  trangThai: number;
  createdAt: string;
  lastLogin: string | null;
}

export interface CreateAccountRequest {
  tenDangNhap: string;
  matKhau: string;
  email: string;
  vaiTro: string;
}

export interface UpdateAccountRequest {
  email: string;
  tenDangNhap: string;
}

export interface AccountSearchParams {
  vaiTro?: string;
  trangThai?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}
