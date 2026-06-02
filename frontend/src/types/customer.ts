export interface CustomerResponse {
  maKhachHang: number;
  hoTen: string;
  cccd: string;
  email: string;
  soDienThoai: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  hoTen: string;
  cccd: string;
  email?: string;
  soDienThoai?: string;
}
