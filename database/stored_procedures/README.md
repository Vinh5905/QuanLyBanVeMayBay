# DB-04: Stored Procedures

Các stored procedure cho nghiệp vụ phức tạp, bảo đảm tính toàn vẹn dữ liệu qua transaction.

## Danh sách Stored Procedures

| File | Tên SP | Mô tả |
|------|--------|-------|
| `01_sp_AuditLog_Insert.sql` | `sp_AuditLog_Insert` | Ghi log audit (fire-and-forget, không dùng transaction) |
| `02_sp_BanVe_Create.sql` | `sp_BanVe_Create` | Bán vé trực tiếp tại quầy — tạo VE ngay với trạng thái `HOP_LE` |
| `03_sp_DatVe_Create.sql` | `sp_DatVe_Create` | Đặt vé online — tạo PHIEUDATCHO + VE (`DANG_GIU_CHO`) |
| `04_sp_ThanhToan_Create.sql` | `sp_ThanhToan_Create` | Thanh toán — kích hoạt VE thành `HOP_LE` |
| `05_sp_HuyVe.sql` | `sp_HuyVe` | Hủy vé + hoàn ghế + tính phí |
| `06_sp_DoiChuyenBay.sql` | `sp_DoiChuyenBay` | Đổi chuyến cùng tuyến + ghi phí đổi |
| `07_sp_CheckIn_Online.sql` | `sp_CheckIn_Online` | Check-in với kiểm tra cửa sổ thời gian |
| `08_sp_HuyDatCho_Auto.sql` | `sp_HuyDatCho_Auto` | Hủy đặt chỗ hết hạn (chạy theo scheduler) |
| `09_sp_Report_DoanhThuThang.sql` | `sp_Report_DoanhThuThang` | Báo cáo doanh thu theo tháng |
| `10_sp_Report_DoanhThuNam.sql` | `sp_Report_DoanhThuNam` | Báo cáo doanh thu theo năm (12 rows) |

## Quy chuẩn

- Mọi SP đều có `BEGIN TRY / BEGIN CATCH` với rollback tự động khi lỗi.
- Trả về `ErrorCode = 0` khi thành công, `> 0` khi lỗi nghiệp vụ.
- `UPDLOCK + HOLDLOCK + ROWLOCK` trên CT_HANGVE để tránh race condition khi đặt vé đồng thời.
- Dùng `TRY_CAST` khi đọc APP_CONFIG để tránh crash nếu giá trị config sai kiểu.

## Trạng thái (Status Strings)

| Bảng | Trạng thái |
|------|-----------|
| `VE.TrangThaiVe` | `HOP_LE`, `DANG_GIU_CHO`, `DA_HUY` |
| `PHIEUDATCHO.TrangThaiDatCho` | `DANG_GIU_CHO`, `DA_THANH_TOAN`, `DA_HUY` |
| `THANHTOAN.TrangThaiThanhToan` | `COMPLETED`, `PENDING` |
| `CHECKIN.TrangThai` | `CHECKED_IN` |

> Schema defaults (`ISSUED`, `PENDING`) là placeholder; các SP dùng các giá trị trên.

## Luồng nghiệp vụ

```
Bán vé thẳng:  sp_BanVe_Create → VE(HOP_LE)
                                    ↓
               sp_CheckIn_Online → CHECKIN

Đặt vé online: sp_DatVe_Create → PHIEUDATCHO(DANG_GIU_CHO) + VE(DANG_GIU_CHO)
                                    ↓
               sp_ThanhToan_Create → THANHTOAN + VE(HOP_LE) + PHIEUDATCHO(DA_THANH_TOAN)
                                    ↓
               sp_CheckIn_Online → CHECKIN

Hủy vé:        sp_HuyVe → VE(DA_HUY) + hoàn ghế CT_HANGVE
Đổi chuyến:    sp_DoiChuyenBay → VE(HOP_LE, chuyến mới) + phí THANHTOAN
Hủy tự động:   sp_HuyDatCho_Auto → PHIEUDATCHO(DA_HUY) + VE(DA_HUY) + hoàn ghế
```

## APP_CONFIG keys sử dụng

| Key | Mặc định | Đơn vị |
|-----|---------|--------|
| `THOI_GIAN_DONG_BAN_VE` | 24 | giờ trước giờ bay |
| `THOI_HAN_THANH_TOAN` | 2 | giờ sau khi đặt |
| `THUE_VAT` | 10 | % |
| `PHI_HUY_VE` | 100000 | VNĐ |
| `PHI_DOI_VE` | 200000 | VNĐ |
| `THOI_GIAN_MO_CHECKIN` | 24 | giờ trước giờ bay |
| `THOI_GIAN_DONG_CHECKIN` | 60 | phút trước giờ bay |

## Deploy

```bash
# Chạy trong Docker container sau khi schema đã được deploy
./database/stored_procedures/run-sp.sh

# Verify
# Dùng sqlcmd chạy 99_verify_sp.sql
```

## Tests

```bash
# Chạy trong Docker container
./database/stored_procedures/tests/run-tests.sh
```

Tests dùng `BEGIN TRAN / ROLLBACK` nên không để lại dữ liệu.
