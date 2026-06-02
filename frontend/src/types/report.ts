export interface MonthlyReportRow {
  maChuyenBay: number;
  maChuyenBayCode: string;
  sanBayDi: string;
  sanBayDen: string;
  ngayGioBay: string;
  doanhThuVe: number;
  doanhThuHanhLy: number;
  soVeBan: number;
  phanTramTrenTong: number;
}

export interface YearlyReportRow {
  thang: number;
  soChuyenBay: number;
  soVe: number;
  doanhThu: number;
  phanTram: number;
}

export interface ReportParams {
  year: number;
  month?: number;
}
