export interface ConfigResponse {
  tenThamSo: string;
  giaTri: string;
  moTa: string;
  capNhatLuc: string;
  capNhatBoi: number | null;
}

export interface UpdateConfigRequest {
  giaTri: string;
}

export interface BatchUpdateConfigRequest {
  thamSo: Record<string, string>;
}
