# Database Scripts

Scripts quản lý vòng đời database cho môi trường development.

## Yêu cầu

- Docker đang chạy với container `vemaybay_sqlserver` (healthy)
- File `.env` đã cấu hình tại root project (copy từ `.env.example`)

## Scripts

### db_backup.sh — Backup database

```bash
./scripts/db_backup.sh
```

Tạo file `.bak` với timestamp trong thư mục `backups/`. Tự động xoay vòng, giữ tối đa 5 bản backup gần nhất.

Tuỳ chỉnh:
- `BACKUP_DIR` — thư mục lưu backup (mặc định: `./backups/`)
- `MAX_BACKUPS` — số bản giữ lại (mặc định: `5`)

### db_restore.sh — Restore database

```bash
# Restore bản backup mới nhất
./scripts/db_restore.sh

# Restore từ file cụ thể
./scripts/db_restore.sh ./backups/VeMayBayDB_20260531_120000.bak
```

Script sẽ hỏi xác nhận trước khi ghi đè database hiện tại.

### db_reset_dev.sh — Reset toàn bộ database (DEV only)

```bash
./scripts/db_reset_dev.sh
```

DROP database và tạo lại từ đầu: schema, stored procedures, triggers, views, functions, seed data. Yêu cầu gõ `reset` để xác nhận.

**CHỈ DÙNG CHO MÔI TRƯỜNG DEVELOPMENT. KHÔNG CHẠY TRÊN PRODUCTION.**

### db_migrate.sh — Chạy migration

```bash
./scripts/db_migrate.sh
```

Chạy các file migration chưa áp dụng trong `database/migrations/`. Theo dõi version đã áp dụng qua bảng `SCHEMA_VERSION`.

## Migrations

Thư mục `database/migrations/` chứa các file migration đánh số:

```
V001__create_initial_schema.sql
V002__add_new_feature.sql
...
```

Quy tắc đặt tên: `V<number>__<description>.sql`

Mỗi migration file phải:
1. Kiểm tra version chưa áp dụng (guard clause)
2. Thực hiện thay đổi schema
3. Ghi version vào bảng `SCHEMA_VERSION`
