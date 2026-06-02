export interface BaggagePricingResponse {
  maBangGia: number;
  tenGoi: string;
  trongLuongToiDa: number;
  giaMuaTruoc: number;
  giaTaiSanBay: number;
}

export interface KienInput {
  trongLuong: number;
  ghiChu: string;
}

export interface RegisterBaggageRequest {
  maVe: number;
  maBangGia: number;
  danhSachKien: KienInput[];
}

export interface BaggageResponse {
  maGoiHanhLy: number;
  maVe: number;
  bangGia: PricingInfo;
  tongTrongLuong: number;
  tongPhi: number;
  trangThai: string;
  danhSachKien: PieceInfo[];
  createdAt: string;
}

export interface PricingInfo {
  maBangGia: number;
  tenGoi: string;
  giaMuaTruoc: number;
  giaTaiSanBay: number;
}

export interface PieceInfo {
  maKienHanhLy: number;
  maTheHanhLy: string;
  trongLuong: number;
  ghiChu: string;
}
