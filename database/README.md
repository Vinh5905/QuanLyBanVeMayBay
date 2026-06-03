# Database Development Environment

Thư mục này chứa script khởi tạo SQL Server cho dự án Quản Lý Bán Vé Máy Bay.

## Yêu cầu

- Docker Desktop có hỗ trợ Docker Compose.
- GNU Make nếu dùng các lệnh rút gọn trong `Makefile`.
- Cổng `1433` chưa bị ứng dụng khác sử dụng, hoặc đổi `SQL_PORT`.

## Biến môi trường

| Biến | Mục đích |
|---|---|
| `SA_PASSWORD` | Mật khẩu quản trị SQL Server trong Docker. Chỉ dùng cho bootstrap và thao tác quản trị. |
| `SQL_PORT` | Cổng SQL Server expose ra máy local. |
| `DB_NAME` | Tên database ứng dụng. |
| `APP_DB_USER` | Login riêng của backend. |
| `APP_DB_PASSWORD` | Mật khẩu login riêng của backend. |

Repository có hai file mẫu:

- `.env.test`: credential cố định, commit-safe, chỉ dùng local development và test.
- `.env.example`: template để tạo `.env` khi cần credential riêng.

Không commit `.env`, credential staging hoặc credential production.

## Khởi động nhanh

```bash
make db-up
make db-verify
```

`make db-up` khởi động SQL Server, chờ healthcheck PASS, chạy các script init idempotent và áp dụng các migration còn thiếu trong `database/migrations/`.
Init runner tạo schema và login least-privilege cho backend sau khi database sẵn sàng; migration runner theo dõi version bằng bảng `SCHEMA_VERSION`.

Có thể chạy Docker Compose trực tiếp:

```bash
docker compose --env-file .env.test up -d
```

Service `sqlserver-init` sẽ chờ SQL Server healthy rồi chạy script bootstrap.

## Các lệnh thường dùng

```bash
make db-status
make db-logs
make db-init
make db-migrate
make db-shell
make db-down
```

Để xóa volume và tạo lại database sạch:

```bash
make db-reset
```

## Kết nối bằng công cụ quản trị

Dùng SSMS, Azure Data Studio hoặc DBeaver:

```text
Server: localhost,1433
User: sa
Password: giá trị SA_PASSWORD trong env file đang dùng
Trust server certificate: true
```

Tài khoản `sa` chỉ dùng cho local bootstrap và quản trị. Backend phải dùng `APP_DB_USER`.
Chi tiết quyền ứng dụng nằm tại `database/security/README.md`.

## Cấu trúc thư mục

```text
database/
├── init/       # Bootstrap database và orchestration script
├── schema/     # Tables, indexes và constraints
├── security/   # Least-privilege login, user và GRANT/DENY
└── seed/       # Seed data cho các issue tiếp theo
```
