# Database Security

Backend phải kết nối SQL Server bằng login riêng trong `APP_DB_USER`. Tài khoản `sa` chỉ dùng trong local bootstrap và thao tác quản trị.

## Bootstrap

`database/security/run-security.sh` chạy tự động sau khi schema hoàn tất:

1. Tạo hoặc cập nhật login từ `APP_DB_USER` và `APP_DB_PASSWORD`.
2. Tạo database user tương ứng.
3. Cấp quyền DML theo từng bảng.
4. Chặn quyền thay đổi schema và tạo database object.
5. Kiểm tra login ứng dụng kết nối được.
6. Chạy verification cho least-privilege policy.

Password được đọc từ env file và không hardcode trong SQL script. Tên database và login chỉ chấp nhận chữ cái, chữ số và dấu gạch dưới để tránh SQLCMD identifier injection.

## Quyền được cấp

| Nhóm | Quyền |
|---|---|
| `VAITRO` | `SELECT` |
| `TAIKHOAN` | `SELECT`, `INSERT`, `UPDATE` |
| `REFRESH_TOKEN` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` để revoke và cleanup token |
| `AUDIT_LOG` | `SELECT`, `INSERT` |
| `APP_CONFIG` | `SELECT`, `INSERT`, `UPDATE` |
| Bảng nghiệp vụ | `SELECT`, `INSERT`, `UPDATE` |
| Stored procedures trong schema `dbo` | `EXECUTE` |

## Quyền bị chặn

- Không được `CREATE TABLE`, `CREATE VIEW`, `CREATE PROCEDURE`, `CREATE FUNCTION`.
- Không được `ALTER` schema `dbo`. Login không được cấp quyền `CONTROL` schema.
- Không được hard-delete `TAIKHOAN`, `AUDIT_LOG`, `APP_CONFIG`, `KHACHHANG`, `CHUYENBAY`, `VE`.
- Không được xem danh sách database khác bằng `VIEW ANY DATABASE`.
- Không được thay đổi login. Login không được cấp quyền `CONTROL SERVER`.

SQL Server vẫn cho login truy cập hạn chế vào một số system database như `master` để đăng nhập và `tempdb` cho thao tác nội bộ. Login ứng dụng không được tạo user hoặc cấp quyền truy cập dữ liệu trong database nghiệp vụ khác.

## Xác minh

Từ root repository:

```bash
make db-init
make db-verify
make db-security-test
```

`make db-init` sẽ fail nếu login không kết nối được hoặc policy verification không PASS.
`make db-security-test` tạo database probe tạm thời và xác nhận app user bị từ chối khi truy cập database khác, tạo table, hard-delete vé hoặc sửa audit log.
