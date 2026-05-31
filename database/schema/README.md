# Database Schema

Các script trong thư mục này tạo schema SQL Server theo thứ tự dependency và có thể chạy lại an toàn.

## Danh sách bảng

| Nhóm | Bảng |
|---|---|
| System | `VAITRO`, `TAIKHOAN`, `REFRESH_TOKEN`, `AUDIT_LOG`, `APP_CONFIG` |
| Core | `HANGTHANHVIEN`, `KHACHHANG`, `SANBAY` |
| Flight | `HANGVE`, `CHUYENBAY`, `TRUNGGIAN`, `CT_HANGVE` |
| Ticket | `PHIEUDATCHO`, `VE` |
| Payment | `THANHTOAN` |
| Baggage | `BANGGIA_HANHLY`, `GOIHANHLY`, `KIENHANHLY` |
| Check-in | `CHECKIN` |

Tổng cộng: 19 bảng.

## Thứ tự chạy

`run-schema.sh` chạy các file `.sql` theo alphabet:

1. Tạo system tables.
2. Tạo core, flight, ticket, payment, baggage và check-in tables.
3. Thêm FK trì hoãn, index và constraint.
4. Xác minh đủ 19 bảng, cột `CHECKIN`, constraint và index quan trọng.

FK `TAIKHOAN.MaKhachHang -> KHACHHANG.MaKhachHang` được thêm tại bước 3 vì `TAIKHOAN` cần tạo trước `KHACHHANG`.

## Chạy thủ công

Từ root repository:

```bash
make db-init
make db-verify
```
