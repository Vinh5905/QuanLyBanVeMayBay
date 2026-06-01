# VeMayBay Backend — Tài liệu API đầy đủ

REST API cho Hệ thống Quản lý Bán Vé Máy Bay. Tài liệu này dành cho **Frontend Agent** muốn tích hợp chính xác với backend.

---

## Mục lục

1. [Tech Stack & Kiến trúc](#1-tech-stack--kiến-trúc)
2. [Cài đặt & Chạy local](#2-cài-đặt--chạy-local)
3. [Cấu trúc project](#3-cấu-trúc-project)
4. [Response format chuẩn](#4-response-format-chuẩn)
5. [Xác thực (Authentication)](#5-xác-thực-authentication)
6. [Phân quyền (RBAC)](#6-phân-quyền-rbac)
7. [API — Authentication](#7-api--authentication)
8. [API — Chuyến bay (Flights)](#8-api--chuyến-bay-flights)
9. [API — Vé (Tickets)](#9-api--vé-tickets)
10. [API — Đặt chỗ (Bookings)](#10-api--đặt-chỗ-bookings)
11. [API — Hành lý (Baggage)](#11-api--hành-lý-baggage)
12. [API — Thanh toán (Payments)](#12-api--thanh-toán-payments)
13. [API — Check-in](#13-api--check-in)
14. [API — Dashboard](#14-api--dashboard)
15. [API — Báo cáo (Reports)](#15-api--báo-cáo-reports)
16. [API — Tài khoản (Accounts)](#16-api--tài-khoản-accounts)
17. [API — Tham số hệ thống (Config)](#17-api--tham-số-hệ-thống-config)
18. [Mã lỗi & HTTP Status](#18-mã-lỗi--http-status)
19. [Luồng nghiệp vụ chính](#19-luồng-nghiệp-vụ-chính)

---

## 1. Tech Stack & Kiến trúc

| Thành phần | Công nghệ |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.4.1 |
| Security | Spring Security + JJWT 0.12.6 |
| ORM | Spring Data JPA / Hibernate 6 |
| Database | SQL Server 2022 (Docker) |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| Build | Maven 3.9 (wrapper included) |
| Container | Docker (multi-stage, `eclipse-temurin:21`) |

**Kiến trúc phân lớp:**

```
HTTP Request
    ↓
Controller (validation @Valid)
    ↓
Service (business logic, gọi stored procedures qua JdbcTemplate)
    ↓
Repository (JPA) hoặc JdbcTemplate (stored procedures)
    ↓
SQL Server
```

**Stored procedures** được gọi trực tiếp cho các nghiệp vụ phức tạp:
- `sp_BanVe_Create` — bán vé tại quầy
- `sp_DatVe_Create` — đặt chỗ online
- `sp_HuyVe` — hủy vé
- `sp_DoiChuyenBay` — đổi chuyến bay
- `sp_ThanhToan_Create` — tạo thanh toán
- `sp_CheckIn_Online` — online check-in
- `sp_Report_DoanhThuThang` — báo cáo doanh thu tháng
- `sp_Report_DoanhThuNam` — báo cáo doanh thu năm

---

## 2. Cài đặt & Chạy local

### Yêu cầu

- Java 21+
- Docker Desktop

### Bước 1: Tạo file `.env`

```bash
# Từ thư mục root project
cp .env.example .env
# Điền SA_PASSWORD, APP_DB_PASSWORD, JWT_SECRET
```

### Bước 2: Khởi động SQL Server

```bash
docker-compose up -d sqlserver sqlserver-init
# Đợi khoảng 30-60 giây cho DB init xong
```

### Bước 3: Chạy backend

```bash
cd backend
./mvnw spring-boot:run
# Hoặc với profile dev:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Bước 4: Kiểm tra

```
GET http://localhost:8080/api/health          → { "status": "UP" }
GET http://localhost:8080/actuator/health     → Spring Actuator
GET http://localhost:8080/swagger-ui/index.html  → Swagger UI
```

### Chạy với Docker (full stack)

```bash
docker-compose up -d
```

### Chạy test (H2 in-memory, không cần SQL Server)

```bash
cd backend
./mvnw test
```

---

## 3. Cấu trúc project

```
backend/
├── src/main/java/com/vemaybay/
│   ├── config/
│   │   ├── CorsConfig.java          # CORS cho localhost:3000 (dev)
│   │   ├── SecurityConfig.java      # Spring Security, stateless JWT
│   │   └── SwaggerConfig.java       # OpenAPI 3 metadata
│   ├── controller/                  # REST endpoints
│   ├── service/                     # Business logic interfaces
│   │   └── impl/                    # Implementations
│   ├── repository/                  # Spring Data JPA repositories
│   ├── entity/                      # JPA entities (map tới DB tables)
│   ├── dto/                         # Request / Response objects
│   │   ├── auth/
│   │   ├── flight/
│   │   ├── ticket/
│   │   ├── baggage/
│   │   ├── payment/
│   │   ├── checkin/
│   │   ├── dashboard/
│   │   ├── report/
│   │   ├── account/
│   │   └── config/
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java  # Bắt tất cả lỗi, trả JSON
│   │   ├── BaseException.java
│   │   ├── BusinessException.java       # HTTP 422
│   │   ├── ResourceNotFoundException.java  # HTTP 404
│   │   ├── ConflictException.java       # HTTP 409
│   │   ├── UnauthorizedException.java   # HTTP 401
│   │   └── ForbiddenException.java      # HTTP 403
│   └── security/
│       ├── JwtTokenProvider.java        # Tạo/xác thực JWT
│       ├── JwtAuthenticationFilter.java # Filter đọc header Authorization
│       ├── UserPrincipal.java           # Principal sau khi auth
│       └── SecurityUtils.java          # getCurrentUserId(), getCurrentRole()
└── src/main/resources/
    ├── application.yml          # Config chính (dùng env vars)
    ├── application-dev.yml      # Profile dev (show-sql: true)
    └── application-test.yml     # Profile test (H2 in-memory)
```

---

## 4. Response format chuẩn

**Mọi API đều trả về cấu trúc này.** Frontend phải đọc field `status` để biết thành công hay lỗi.

### 4.1 Thành công đơn lẻ

```json
{
  "status": "success",
  "code": 200,
  "message": "Thành công",
  "data": { ... },
  "timestamp": "2026-06-01T10:30:00",
  "requestId": "a1b2c3d4-uuid-v4"
}
```

### 4.2 Thành công tạo mới (HTTP 201)

```json
{
  "status": "success",
  "code": 201,
  "message": "Tạo mới thành công",
  "data": { ... },
  "timestamp": "2026-06-01T10:30:00",
  "requestId": "a1b2c3d4-uuid-v4"
}
```

### 4.3 Danh sách có phân trang

```json
{
  "status": "success",
  "code": 200,
  "message": "Thành công",
  "data": [ ... ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "timestamp": "2026-06-01T10:30:00",
  "requestId": "a1b2c3d4-uuid-v4"
}
```

### 4.4 Lỗi validation (HTTP 400)

```json
{
  "status": "error",
  "code": 400,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "maChuyenBay", "message": "Mã chuyến bay không được để trống" },
    { "field": "ngayGioBay", "message": "Ngày giờ bay phải lớn hơn thời điểm hiện tại" }
  ],
  "timestamp": "2026-06-01T10:30:00",
  "requestId": "a1b2c3d4-uuid-v4"
}
```

### 4.5 Lỗi nghiệp vụ / không tìm thấy / xung đột

```json
{
  "status": "error",
  "code": 422,
  "message": "Không thể hủy vé đã check-in",
  "timestamp": "2026-06-01T10:30:00",
  "requestId": "a1b2c3d4-uuid-v4"
}
```

> **Lưu ý:** Field `data`, `pagination`, `errors` chỉ xuất hiện khi có giá trị (dùng `@JsonInclude(NON_NULL)`).

---

## 5. Xác thực (Authentication)

Backend dùng **stateless JWT**. Không có session, không có cookie.

### Cách gửi token

```
Authorization: Bearer <accessToken>
```

### Token lifetime (mặc định)

| Token | Thời hạn |
|---|---|
| Access Token | 60 phút (`ACCESS_TOKEN_MINUTES` trong THAM_SO) |
| Refresh Token | 30 ngày (`REFRESH_TOKEN_EXPIRY_DAYS` trong THAM_SO) |

### Flow xác thực

```
1. POST /api/auth/login  →  nhận accessToken + refreshToken
2. Gửi request kèm header: Authorization: Bearer <accessToken>
3. Khi accessToken hết hạn → POST /api/auth/refresh với refreshToken
4. Khi đăng xuất → POST /api/auth/logout (thu hồi refreshToken)
```

### Brute-force protection

- Nhập sai mật khẩu **5 lần trong 15 phút** → tài khoản bị **khóa 15 phút**
- Backend trả `HTTP 401` với message mô tả số lần còn lại / thời gian unlock

---

## 6. Phân quyền (RBAC)

| Role | Mô tả |
|---|---|
| `Admin` | Quản trị viên hệ thống |
| `NhanVien` | Nhân viên hãng (quầy vé, sân bay) |
| `DaiLy` | Đại lý bán vé |
| `KhachHang` | Khách hàng đặt vé online |

Khi gọi API bị từ chối quyền → `HTTP 403 Forbidden`.  
Khi chưa đăng nhập → `HTTP 401 Unauthorized`.

---

## 7. API — Authentication

**Base path:** `/api/auth`

---

### 7.1 Đăng nhập

```
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "tenDangNhap": "admin",
  "matKhau": "Admin@123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "a3f8c2d1...",
    "expiresIn": 3600000,
    "userInfo": {
      "maTaiKhoan": 1,
      "tenDangNhap": "admin",
      "email": "admin@airline.vn",
      "vaiTro": "Admin"
    }
  }
}
```

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 401 | Sai tên đăng nhập hoặc mật khẩu |
| 401 | Tài khoản bị khóa. Thử lại sau X phút |
| 401 | Tài khoản không hoạt động |

---

### 7.2 Đăng ký (khách hàng)

```
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "tenDangNhap": "nguyenvana",
  "matKhau": "Abc@1234",
  "email": "nguyenvana@gmail.com",
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0901234567",
  "cccd": "079200012345"
}
```

> `soDienThoai` và `cccd` là tùy chọn (optional).

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Đăng ký tài khoản thành công",
  "data": null
}
```

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 409 | Tên đăng nhập đã tồn tại |
| 409 | Email đã được sử dụng |
| 400 | Validation lỗi (xem field `errors`) |

---

### 7.3 Làm mới token

```
POST /api/auth/refresh
Content-Type: application/json
```

**Request:**
```json
{
  "refreshToken": "a3f8c2d1..."
}
```

**Response (200):** Trả cấu trúc giống `login` — `accessToken` mới, `refreshToken` mới (rotation).

---

### 7.4 Đăng xuất

```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request (optional body):**
```json
{
  "refreshToken": "a3f8c2d1..."
}
```

> Gửi `refreshToken` để thu hồi ngay lập tức. Nếu không gửi, chỉ invalidate access token hiện tại.

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### 7.5 Lấy thông tin user hiện tại

```
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "maTaiKhoan": 1,
    "tenDangNhap": "admin",
    "email": "admin@airline.vn",
    "vaiTro": "Admin"
  }
}
```

---

### 7.6 Đổi mật khẩu

```
PUT /api/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request:**
```json
{
  "matKhauHienTai": "Abc@1234",
  "matKhauMoi": "NewPass@5678"
}
```

**Response (200):** `{ "message": "Đổi mật khẩu thành công" }`

---

## 8. API — Chuyến bay (Flights)

**Base path:** `/api/flights`

---

### 8.1 Danh sách chuyến bay (public)

```
GET /api/flights?sanBayDi=SGN&sanBayDen=HAN&ngayBay=2026-06-15&page=0&size=20&sort=ngayGioBay,asc
```

**Query params:**

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `sanBayDi` | string | không | Mã IATA sân bay đi (VD: `SGN`, `HAN`) |
| `sanBayDen` | string | không | Mã IATA sân bay đến |
| `ngayBay` | date `YYYY-MM-DD` | không | Lọc theo ngày bay |
| `trangThai` | string | không | `SCHEDULED`, `CANCELLED` |
| `page` | int | không | Trang (default: 0) |
| `size` | int | không | Số phần tử/trang (default: 20) |
| `sort` | string | không | `ngayGioBay,asc` hoặc `ngayGioBay,desc` |

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "maChuyenBay": 1,
      "maChuyenBayCode": "VN123",
      "sanBayDi": {
        "maSanBay": "SGN",
        "tenSanBay": "Tân Sơn Nhất",
        "thanhPho": "Hồ Chí Minh"
      },
      "sanBayDen": {
        "maSanBay": "HAN",
        "tenSanBay": "Nội Bài",
        "thanhPho": "Hà Nội"
      },
      "ngayGioBay": "2026-06-15T08:00:00",
      "thoiGianBay": 120,
      "giaCoBan": 1200000.00,
      "trangThaiChuyenBay": "SCHEDULED",
      "danhSachHangVe": [
        {
          "maHangVe": 1,
          "tenHangVe": "Phổ thông",
          "soLuong": 150,
          "soGheDaDat": 45,
          "soGheCon": 105,
          "donGia": 1200000.00
        },
        {
          "maHangVe": 2,
          "tenHangVe": "Thương gia",
          "soLuong": 20,
          "soGheDaDat": 5,
          "soGheCon": 15,
          "donGia": 3500000.00
        }
      ],
      "danhSachTrungGian": [],
      "createdAt": "2026-05-01T09:00:00"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 12,
    "totalPages": 1
  }
}
```

---

### 8.2 Tìm kiếm chuyến bay (public)

```
GET /api/flights/search?sanBayDi=SGN&sanBayDen=HAN&ngayBay=2026-06-15
```

> Giống `/api/flights` nhưng trả `data` là array (không có pagination). Dùng cho search bar.

---

### 8.3 Danh sách sân bay (public)

```
GET /api/flights/airports
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "maSanBay": "SGN",
      "tenSanBay": "Tân Sơn Nhất",
      "thanhPho": "Hồ Chí Minh",
      "quocGia": "Việt Nam"
    },
    {
      "maSanBay": "HAN",
      "tenSanBay": "Nội Bài",
      "thanhPho": "Hà Nội",
      "quocGia": "Việt Nam"
    }
  ]
}
```

---

### 8.4 Chi tiết chuyến bay (public)

```
GET /api/flights/{id}
```

**Response (200):** Trả 1 object `FlightResponse` như trong mục 8.1.

**Lỗi:** `404` nếu không tìm thấy hoặc đã bị xóa.

---

### 8.5 Tạo chuyến bay

```
POST /api/flights
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:**
```json
{
  "maChuyenBayCode": "VN456",
  "sanBayDi": "SGN",
  "sanBayDen": "DAD",
  "ngayGioBay": "2026-07-01T06:30:00",
  "thoiGianBay": 75,
  "giaCoBan": 900000,
  "danhSachHangVe": [
    { "maHangVe": 1, "soLuong": 150, "donGia": 900000 },
    { "maHangVe": 2, "soLuong": 20,  "donGia": 2500000 }
  ],
  "danhSachTrungGian": []
}
```

> `danhSachTrungGian` optional, tối đa 2 điểm dừng. Mỗi điểm dừng có `thoiGianDung` từ 45-120 phút.

**Response (201):** Object `FlightResponse` đầy đủ.

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 409 | Mã chuyến bay đã tồn tại |
| 400 | Thời gian bay tối thiểu 30 phút |
| 400 | Ngày giờ bay phải lớn hơn thời điểm hiện tại |
| 400 | Tối đa 2 sân bay trung gian |

---

### 8.6 Cập nhật chuyến bay

```
PUT /api/flights/{id}
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:** Tất cả field đều optional (chỉ gửi field cần cập nhật):
```json
{
  "ngayGioBay": "2026-07-01T07:00:00",
  "giaCoBan": 950000
}
```

**Response (200):** Object `FlightResponse` đã cập nhật.

---

### 8.7 Hủy chuyến bay (soft delete)

```
DELETE /api/flights/{id}
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):** `{ "message": "Hủy chuyến bay thành công" }`

**Lỗi:** `422` nếu chuyến bay đã có vé bán.

---

## 9. API — Vé (Tickets)

**Base path:** `/api/tickets`

---

### 9.1 Danh sách vé (Admin/NhanVien)

```
GET /api/tickets?maKhachHang=5&trangThaiVe=HOP_LE&page=0&size=20
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Query params:**

| Param | Mô tả |
|---|---|
| `maKhachHang` | Lọc theo khách hàng |
| `maChuyenBay` | Lọc theo chuyến bay |
| `trangThaiVe` | `HOP_LE`, `DANG_GIU_CHO`, `DA_HUY`, `DA_DOI` |
| `page`, `size`, `sort` | Phân trang |

**Response (200):** Paginated list of `TicketResponse`.

---

### 9.2 Vé của tôi (KhachHang/DaiLy)

```
GET /api/tickets/my
Authorization: Bearer <token>   (KhachHang hoặc DaiLy)
```

**Response (200):** Array `TicketResponse` của user hiện tại.

---

### 9.3 Chi tiết vé

```
GET /api/tickets/{id}
Authorization: Bearer <token>   (mọi role đã đăng nhập)
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "maVe": 101,
    "maVeCode": "VE20260601001",
    "chuyenBay": {
      "maChuyenBay": 1,
      "maChuyenBayCode": "VN123",
      "sanBayDi": "SGN",
      "tenSanBayDi": "Tân Sơn Nhất",
      "sanBayDen": "HAN",
      "tenSanBayDen": "Nội Bài",
      "ngayGioBay": "2026-06-15T08:00:00"
    },
    "hangVe": {
      "maHangVe": 1,
      "tenHangVe": "Phổ thông",
      "donGia": 1200000.00
    },
    "khachHang": {
      "maKhachHang": 5,
      "hoTen": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "soDienThoai": "0901234567",
      "cccd": "079200012345"
    },
    "giaVe": 1200000.00,
    "trangThaiVe": "HOP_LE",
    "maPhieuDatCho": null,
    "createdAt": "2026-06-01T09:30:00"
  }
}
```

**Trạng thái vé:**

| Giá trị | Ý nghĩa |
|---|---|
| `HOP_LE` | Vé hợp lệ, đã thanh toán |
| `DANG_GIU_CHO` | Đang giữ chỗ, chưa thanh toán |
| `DA_HUY` | Đã hủy |
| `DA_DOI` | Đã đổi sang chuyến khác |

---

### 9.4 Bán vé (tại quầy)

```
POST /api/tickets/sell
Authorization: Bearer <token>   (Admin, NhanVien, DaiLy)
Content-Type: application/json
```

**Request:**
```json
{
  "maChuyenBay": 1,
  "maKhachHang": 5,
  "maHangVe": 1
}
```

**Response (201):** Object `TicketResponse` với `trangThaiVe: "HOP_LE"`.

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 404 | Không tìm thấy chuyến bay / khách hàng / hạng vé |
| 422 | Không còn ghế trống hạng này |
| 422 | Quầy vé đã đóng (trong vòng 45 phút trước khởi hành) |

---

### 9.5 Đổi chuyến bay

```
PUT /api/tickets/{id}/change-flight
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:**
```json
{
  "maChuyenBayMoi": 8
}
```

> Chuyến mới phải **cùng tuyến** (cùng sân bay đi & đến) và còn ghế trống hạng tương ứng.

**Response (200):** Object `TicketResponse` với `trangThaiVe: "HOP_LE"` và chuyến bay mới.

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 422 | Chỉ đổi được trước 24 giờ so với giờ khởi hành |
| 422 | Chuyến bay mới phải cùng tuyến đường |
| 422 | Chuyến bay mới không còn ghế |
| 422 | Vé không ở trạng thái HOP_LE |

---

### 9.6 Nâng hạng ghế

```
PUT /api/tickets/{id}/upgrade
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:**
```json
{
  "maHangVeMoi": 2
}
```

**Response (200):** Object `TicketResponse` với hạng vé mới và giá mới.

**Lỗi:** `422` nếu hạng mới không còn ghế hoặc vé không hợp lệ.

---

### 9.7 Hủy vé

```
DELETE /api/tickets/{id}
Authorization: Bearer <token>   (mọi role đã đăng nhập)
```

**Response (200):** `{ "message": "Hủy vé thành công" }`

**Lỗi:** `422` nếu vé đã check-in hoặc đã bay.

---

## 10. API — Đặt chỗ (Bookings)

**Base path:** `/api/bookings`

Dùng cho luồng khách hàng đặt vé online: **đặt chỗ → thanh toán → vé HOP_LE**. Ghế được giữ trong **2 giờ** (tham số `ThoiHanThanhToan`).

---

### 10.1 Tạo đặt chỗ

```
POST /api/bookings
Authorization: Bearer <token>   (KhachHang)
Content-Type: application/json
```

**Request:**
```json
{
  "maChuyenBay": 1,
  "maHangVe": 1
}
```

> Hệ thống tự lấy `maKhachHang` từ token của user hiện tại.

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Đặt vé thành công",
  "data": {
    "maPhieuDatCho": 55,
    "ve": {
      "maVe": 101,
      "maVeCode": "VE20260601001",
      "trangThaiVe": "DANG_GIU_CHO",
      ...
    },
    "tongTien": 1200000.00,
    "trangThaiDatCho": "DANG_GIU_CHO",
    "hanThanhToan": "2026-06-01T11:30:00",
    "createdAt": "2026-06-01T09:30:00"
  }
}
```

> **`hanThanhToan`** là deadline thanh toán. Frontend nên hiển thị countdown timer.

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 422 | Không còn ghế trống hạng này |
| 422 | Chỉ được đặt trước 120 phút so với giờ khởi hành |
| 409 | Khách hàng đã có phiếu đặt chỗ chờ thanh toán cho chuyến này |

---

### 10.2 Danh sách đặt chỗ (Admin/NhanVien)

```
GET /api/bookings?trangThaiVe=DANG_GIU_CHO&page=0&size=20
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response:** Paginated list of `BookingResponse`.

---

### 10.3 Đặt chỗ của tôi (KhachHang)

```
GET /api/bookings/my
Authorization: Bearer <token>   (KhachHang)
```

**Response:** Array `BookingResponse` của user hiện tại.

---

### 10.4 Hủy đặt chỗ

```
DELETE /api/bookings/{id}
Authorization: Bearer <token>   (mọi role đã đăng nhập)
```

**Response (200):** `{ "message": "Hủy đặt chỗ thành công" }`

---

## 11. API — Hành lý (Baggage)

**Base path:** `/api/baggage`

---

### 11.1 Bảng giá hành lý (public)

```
GET /api/baggage/pricing
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "maBangGia": 1,
      "tenGoi": "Gói 20kg",
      "trongLuongToiDa": 20.0,
      "giaMuaTruoc": 250000.00,
      "giaTaiSanBay": 350000.00
    },
    {
      "maBangGia": 2,
      "tenGoi": "Gói 30kg",
      "trongLuongToiDa": 30.0,
      "giaMuaTruoc": 350000.00,
      "giaTaiSanBay": 480000.00
    }
  ]
}
```

> `giaMuaTruoc` áp dụng khi mua **trước 3 giờ** so với giờ khởi hành (tham số `ThoiGianMuaHanhLyUuDai`).  
> `giaTaiSanBay` áp dụng khi mua muộn hơn.

---

### 11.2 Đăng ký hành lý

```
POST /api/baggage
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "maVe": 101,
  "maBangGia": 1,
  "danhSachKien": [
    { "trongLuong": 18.5, "ghiChu": "Vali cứng màu xanh" },
    { "trongLuong": 12.0, "ghiChu": null }
  ]
}
```

> - Mỗi kiện tối đa **32 kg**
> - Tối đa **15 kiện** / gói
> - Hệ thống tự chọn giá `Mua trước` hay `Tại quầy` dựa vào thời gian hiện tại

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Đăng ký hành lý thành công",
  "data": {
    "maGoiHanhLy": 33,
    "maVe": 101,
    "bangGia": {
      "maBangGia": 1,
      "tenGoi": "Gói 20kg",
      "trongLuongToiDa": 20.0,
      "giaMuaTruoc": 250000.00,
      "giaTaiSanBay": 350000.00
    },
    "tongTrongLuong": 30.5,
    "tongPhi": 500000.00,
    "trangThai": "ACTIVE",
    "danhSachKien": [
      {
        "maKienHanhLy": 61,
        "maTheHanhLy": "HL202606011030001",
        "trongLuong": 18.5,
        "ghiChu": "Vali cứng màu xanh"
      },
      {
        "maKienHanhLy": 62,
        "maTheHanhLy": "HL202606011030002",
        "trongLuong": 12.0,
        "ghiChu": null
      }
    ],
    "createdAt": "2026-06-01T10:30:00"
  }
}
```

---

### 11.3 Hành lý theo vé

```
GET /api/baggage/ticket/{maVe}
Authorization: Bearer <token>
```

**Response (200):** Array `BaggageResponse` của vé đó.

---

### 11.4 Hủy gói hành lý

```
DELETE /api/baggage/{id}
Authorization: Bearer <token>
```

**Response (200):** `{ "message": "Hủy gói hành lý thành công" }`

---

## 12. API — Thanh toán (Payments)

**Base path:** `/api/payments`

Mỗi thanh toán gắn với **một** trong hai: `maPhieuDatCho` (đặt chỗ) hoặc `maVe` (vé trực tiếp). Gửi đúng một trong hai, không gửi cả hai.

---

### 12.1 Tạo thanh toán

```
POST /api/payments
Authorization: Bearer <token>   (mọi role đã đăng nhập)
Content-Type: application/json
```

**Trường hợp 1 — Thanh toán phiếu đặt chỗ:**
```json
{
  "maPhieuDatCho": 55,
  "hinhThucThanhToan": "MOMO",
  "soTienThanhToan": 1200000.00,
  "maGiaoDich": "MOMO_TXN_20260601_001"
}
```

**Trường hợp 2 — Thanh toán vé trực tiếp (mua hành lý, etc.):**
```json
{
  "maVe": 101,
  "hinhThucThanhToan": "CASH",
  "soTienThanhToan": 500000.00,
  "maGiaoDich": null
}
```

**Hình thức thanh toán hỗ trợ:** `CASH`, `CARD`, `MOMO`, `ZALOPAY`, `BANK_TRANSFER`

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Thanh toán thành công",
  "data": {
    "maThanhToan": 201,
    "maVe": 101,
    "maPhieuDatCho": 55,
    "soTien": 1200000.00,
    "thueVAT": 120000.00,
    "phuongThuc": "MOMO",
    "trangThaiThanhToan": "COMPLETED",
    "maGiaoDich": "MOMO_TXN_20260601_001",
    "thoiGianThanhToan": "2026-06-01T10:00:00",
    "createdAt": "2026-06-01T10:00:00"
  }
}
```

> Sau khi thanh toán thành công, vé từ `DANG_GIU_CHO` → `HOP_LE` tự động.

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 422 | Phiếu đặt chỗ đã hết hạn thanh toán |
| 422 | Số tiền thanh toán không đủ |
| 422 | Phiếu đặt chỗ không ở trạng thái DANG_GIU_CHO |
| 400 | Phải cung cấp maPhieuDatCho hoặc maVe (không được thiếu cả hai) |

---

### 12.2 Chi tiết thanh toán (Admin/NhanVien)

```
GET /api/payments/{id}
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):** Object `PaymentResponse`.

---

### 12.3 Danh sách thanh toán (Admin/NhanVien)

```
GET /api/payments?maVe=101&trangThai=COMPLETED&page=0&size=20
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):** Paginated list of `PaymentResponse`.

---

## 13. API — Check-in

**Base path:** `/api/checkin`

Cửa sổ check-in online: **24 giờ** trước → **60 phút** trước giờ khởi hành (tham số `ThoiGianMoCheckInOnline`, `ThoiGianDongCheckInOnline`).

---

### 13.1 Thực hiện check-in

```
POST /api/checkin
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "maVe": 101,
  "soGhe": "12A"
}
```

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Check-in thành công",
  "data": {
    "maCheckIn": 77,
    "boardingPassCode": "BP-VN123-20260615-001",
    "soGhe": "12A",
    "trangThai": "CHECKED_IN",
    "checkInAt": "2026-06-14T10:00:00",
    "ve": {
      "maVe": 101,
      "maVeCode": "VE20260601001",
      "trangThaiVe": "HOP_LE",
      "hangVe": "Phổ thông"
    },
    "hanhKhach": {
      "hoTen": "Nguyễn Văn A",
      "cccd": "079200012345",
      "email": "nguyenvana@gmail.com"
    },
    "chuyenBay": {
      "maChuyenBayCode": "VN123",
      "sanBayDi": "SGN",
      "tenSanBayDi": "Tân Sơn Nhất",
      "sanBayDen": "HAN",
      "tenSanBayDen": "Nội Bài",
      "ngayGioBay": "2026-06-15T08:00:00"
    }
  }
}
```

**Lỗi thường gặp:**

| HTTP | message |
|---|---|
| 422 | Chưa đến giờ mở check-in online (trước 24h) |
| 422 | Check-in online đã đóng (trong vòng 60 phút trước giờ bay) |
| 409 | Vé đã được check-in |
| 422 | Vé không ở trạng thái HOP_LE |

---

### 13.2 Lấy boarding pass

```
GET /api/checkin/{maVe}
Authorization: Bearer <token>
```

**Response (200):** Object `BoardingPassResponse` như trên.

---

## 14. API — Dashboard

**Base path:** `/api/dashboard`  
**Quyền truy cập:** Admin, NhanVien

---

### 14.1 Tổng quan hệ thống

```
GET /api/dashboard/summary
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "tongVeHomNay": 42,
    "doanhThuHomNay": 52000000.00,
    "soChuyenBayHomNay": 8,
    "soKhachMoiThangNay": 156
  }
}
```

---

### 14.2 Biểu đồ doanh thu 30 ngày gần nhất

```
GET /api/dashboard/charts/revenue
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    { "ngay": "2026-05-02", "doanhThu": 15000000.00 },
    { "ngay": "2026-05-03", "doanhThu": 22000000.00 },
    ...
    { "ngay": "2026-06-01", "doanhThu": 52000000.00 }
  ]
}
```

> Chỉ có các ngày **có giao dịch** mới xuất hiện. Ngày không có doanh thu → không có trong array.

---

### 14.3 Biểu đồ cơ cấu hạng vé

```
GET /api/dashboard/charts/tickets
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    { "hangVe": "Phổ thông",   "soLuong": 1250, "phanTram": 78.1 },
    { "hangVe": "Thương gia",  "soLuong": 280,  "phanTram": 17.5 },
    { "hangVe": "Hạng nhất",   "soLuong": 70,   "phanTram": 4.4  }
  ]
}
```

---

### 14.4 10 vé gần nhất

```
GET /api/dashboard/recent/tickets
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):** Array 10 phần tử `TicketResponse` mới nhất, trạng thái `HOP_LE`.

---

### 14.5 Chuyến bay hôm nay

```
GET /api/dashboard/today/flights
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):** Array `FlightResponse` các chuyến bay trong ngày hiện tại, sắp xếp theo giờ bay tăng dần.

---

## 15. API — Báo cáo (Reports)

**Base path:** `/api/reports`  
**Quyền truy cập:** Admin, NhanVien

---

### 15.1 Báo cáo doanh thu tháng

```
GET /api/reports/monthly?year=2026&month=6
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "maChuyenBay": 1,
      "maChuyenBayCode": "VN123",
      "sanBayDi": "SGN - Tân Sơn Nhất",
      "sanBayDen": "HAN - Nội Bài",
      "ngayGioBay": "2026-06-15T08:00:00",
      "doanhThuVe": 45000000.00,
      "doanhThuHanhLy": 5200000.00,
      "soVeBan": 38,
      "phanTramTrenTong": 12.5
    },
    ...
  ]
}
```

**Lỗi:** `400` nếu `month` ngoài khoảng 1-12.

---

### 15.2 Báo cáo doanh thu năm

```
GET /api/reports/yearly?year=2026
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "thang": 1,
      "soChuyenBay": 45,
      "soVe": 1820,
      "doanhThu": 2184000000.00,
      "phanTram": 8.2
    },
    ...
  ]
}
```

---

### 15.3 Xuất báo cáo Excel

```
GET /api/reports/export?year=2026&month=6&format=excel
Authorization: Bearer <token>   (Admin hoặc NhanVien)
```

**Response:** Binary file `.xlsx`

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="bao-cao-thang-6-2026.xlsx"
```

> **Cách download trong frontend:**
> ```javascript
> const response = await fetch('/api/reports/export?year=2026&month=6', {
>   headers: { Authorization: `Bearer ${token}` }
> });
> const blob = await response.blob();
> const url = URL.createObjectURL(blob);
> const a = document.createElement('a');
> a.href = url;
> a.download = 'bao-cao-thang-6-2026.xlsx';
> a.click();
> ```

---

## 16. API — Tài khoản (Accounts)

**Base path:** `/api/accounts`  
**Quyền truy cập:** Admin only

---

### 16.1 Danh sách tài khoản

```
GET /api/accounts?vaiTro=NhanVien&trangThai=1&keyword=nguyen&page=0&size=20
Authorization: Bearer <token>   (Admin)
```

**Query params:**

| Param | Mô tả |
|---|---|
| `vaiTro` | `Admin`, `NhanVien`, `DaiLy`, `KhachHang` |
| `trangThai` | `1` = đang hoạt động, `0` = bị khóa |
| `keyword` | Tìm theo tên đăng nhập hoặc email |

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "maTaiKhoan": 2,
      "tenDangNhap": "staff01",
      "email": "staff01@airline.vn",
      "vaiTro": "NhanVien",
      "maVaiTro": 2,
      "maKhachHang": null,
      "trangThai": 1,
      "createdAt": "2026-05-01T08:00:00",
      "lastLogin": "2026-06-01T07:45:00"
    }
  ],
  "pagination": { "page": 0, "size": 20, "totalElements": 5, "totalPages": 1 }
}
```

---

### 16.2 Chi tiết tài khoản

```
GET /api/accounts/{id}
Authorization: Bearer <token>   (Admin)
```

**Response (200):** Object `AccountResponse`.

---

### 16.3 Tạo tài khoản

```
POST /api/accounts
Authorization: Bearer <token>   (Admin)
Content-Type: application/json
```

**Request:**
```json
{
  "tenDangNhap": "staff02",
  "matKhau": "Staff@2026",
  "email": "staff02@airline.vn",
  "vaiTro": "NhanVien"
}
```

> `vaiTro` chỉ được là `NhanVien` hoặc `DaiLy`. Admin không thể tự tạo Admin.

**Response (201):** Object `AccountResponse`.

**Lỗi:**

| HTTP | message |
|---|---|
| 409 | Tên đăng nhập đã tồn tại |
| 409 | Email đã được sử dụng |
| 400 | Chỉ được tạo tài khoản NhanVien hoặc DaiLy |

---

### 16.4 Cập nhật tài khoản

```
PUT /api/accounts/{id}
Authorization: Bearer <token>   (Admin)
Content-Type: application/json
```

**Request:**
```json
{
  "email": "staff02new@airline.vn",
  "tenDangNhap": "staff02_new"
}
```

> Chỉ gửi field cần thay đổi.

**Response (200):** Object `AccountResponse` đã cập nhật.

---

### 16.5 Khóa / Mở khóa tài khoản

```
PUT /api/accounts/{id}/status?active=false
Authorization: Bearer <token>   (Admin)
```

> `active=true` để mở khóa, `active=false` để khóa.

**Response (200):** `{ "message": "Tài khoản đã bị khóa" }`

> Tài khoản bị khóa → đăng nhập trả `401 Tài khoản không hoạt động`.

---

### 16.6 Admin reset mật khẩu

```
PUT /api/accounts/{id}/reset-password
Authorization: Bearer <token>   (Admin)
Content-Type: application/json
```

**Request:**
```json
{
  "matKhauMoi": "NewPass@2026"
}
```

**Response (200):** `{ "message": "Đặt lại mật khẩu thành công" }`

---

## 17. API — Tham số hệ thống (Config)

**Base path:** `/api/config`  
**Quyền truy cập:** Admin, NhanVien (GET); Admin, NhanVien (PUT)

Bảng `THAM_SO` chứa các hằng số nghiệp vụ có thể cấu hình. Thay đổi có hiệu lực **ngay lập tức** với giao dịch mới.

---

### 17.1 Lấy tất cả tham số

```
GET /api/config
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "tenThamSo": "ThoiGianDongBanVe",
      "giaTri": "45",
      "moTa": "Phút trước giờ bay đóng bán vé tại quầy",
      "capNhatLuc": "2026-05-31T08:00:00",
      "capNhatBoi": 1
    },
    {
      "tenThamSo": "TGDatVeChamNhat",
      "giaTri": "120",
      "moTa": "Phút trước giờ bay để đặt vé qua app/web",
      "capNhatLuc": "2026-05-31T08:00:00",
      "capNhatBoi": 1
    }
  ]
}
```

**Tham số quan trọng frontend cần biết:**

| Tên | Đơn vị | Ý nghĩa |
|---|---|---|
| `TuoiMuaVeToiThieu` | Năm | Tuổi tối thiểu khách hàng (default: 18) |
| `TGDatVeChamNhat` | Phút | Hạn đặt vé online trước giờ bay (default: 120) |
| `ThoiGianDongBanVe` | Phút | Hạn bán vé tại quầy trước giờ bay (default: 45) |
| `TGHuyChamNhat` | Phút | Hạn hủy vé trước giờ bay (default: 0 = mọi lúc) |
| `ThoiGianChoPhepDoiVe` | Giờ | Hạn đổi chuyến trước giờ bay (default: 24) |
| `ThoiHanThanhToan` | Giờ | Thời gian giữ chỗ sau đặt vé (default: 2) |
| `ThueVAT` | % | Thuế VAT (default: 10) |
| `TrongLuongToiDaMotKien` | Kg | Trọng lượng tối đa 1 kiện hành lý (default: 32) |
| `SoKienToiDa` | Kiện | Số kiện tối đa trong 1 gói (default: 15) |
| `ThoiGianMuaHanhLyUuDai` | Giờ | Mua trước X giờ → giá ưu đãi (default: 3) |
| `ThoiGianMoCheckInOnline` | Giờ | Mở check-in online trước X giờ (default: 24) |
| `ThoiGianDongCheckInOnline` | Phút | Đóng check-in online trước X phút (default: 60) |
| `ACCESS_TOKEN_MINUTES` | Phút | Thời hạn access token (default: 30) |
| `REFRESH_TOKEN_EXPIRY_DAYS` | Ngày | Thời hạn refresh token (default: 7) |

---

### 17.2 Lấy tham số theo key

```
GET /api/config/{key}
Authorization: Bearer <token>
```

**Ví dụ:** `GET /api/config/ThueVAT`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "tenThamSo": "ThueVAT",
    "giaTri": "10",
    "moTa": "% thuế VAT áp dụng lên tổng thanh toán",
    "capNhatLuc": "2026-05-31T08:00:00",
    "capNhatBoi": 1
  }
}
```

---

### 17.3 Cập nhật một tham số

```
PUT /api/config/{key}
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:**
```json
{
  "giaTri": "15"
}
```

**Response (200):** Object `ConfigResponse` đã cập nhật.

**Lỗi:** `422` nếu giá trị vi phạm ràng buộc (VD: `ThoiGianDongBanVe` ≥ `TGDatVeChamNhat`).

---

### 17.4 Cập nhật nhiều tham số cùng lúc

```
PUT /api/config/batch
Authorization: Bearer <token>   (Admin hoặc NhanVien)
Content-Type: application/json
```

**Request:**
```json
{
  "thamSo": {
    "ThoiGianDongBanVe": "30",
    "TGDatVeChamNhat": "90"
  }
}
```

**Response (200):** Array `ConfigResponse` của các tham số đã cập nhật.

---

## 18. Mã lỗi & HTTP Status

| HTTP Status | Ý nghĩa | Khi nào xảy ra |
|---|---|---|
| `200` | Thành công | GET, PUT, DELETE thành công |
| `201` | Tạo mới thành công | POST tạo tài nguyên |
| `400` | Dữ liệu không hợp lệ | Validation lỗi, thiếu tham số, sai kiểu dữ liệu |
| `401` | Chưa xác thực | Không có token, token hết hạn, sai mật khẩu |
| `403` | Không có quyền | Role không đủ quyền truy cập endpoint |
| `404` | Không tìm thấy | ID không tồn tại hoặc đã bị xóa |
| `409` | Xung đột dữ liệu | Tên đăng nhập trùng, email trùng, đã check-in rồi |
| `422` | Vi phạm nghiệp vụ | Hủy vé đã bay, không đủ ghế, quá hạn đặt vé |
| `500` | Lỗi server | Lỗi không xác định, log server |

**Cách xử lý lỗi trong frontend:**

```javascript
const res = await fetch('/api/tickets/sell', { method: 'POST', ... });
const body = await res.json();

if (body.status === 'error') {
  if (res.status === 400 && body.errors) {
    // Validation errors — gán lỗi vào từng field của form
    body.errors.forEach(e => setFieldError(e.field, e.message));
  } else if (res.status === 401) {
    // Hết hạn token → redirect sang trang login
    redirectToLogin();
  } else if (res.status === 403) {
    showError('Bạn không có quyền thực hiện thao tác này');
  } else {
    // 404, 409, 422 → hiển thị body.message trực tiếp
    showError(body.message);
  }
}
```

---

## 19. Luồng nghiệp vụ chính

### 19.1 Luồng khách hàng đặt vé online

```
1. GET /api/flights?sanBayDi=SGN&sanBayDen=HAN&ngayBay=2026-06-15
   → Tìm chuyến bay, lấy maChuyenBay và maHangVe

2. POST /api/bookings  { maChuyenBay, maHangVe }
   → Tạo phiếu đặt chỗ, nhận maPhieuDatCho + hanThanhToan
   → Frontend hiển thị countdown timer tới hanThanhToan

3. POST /api/payments  { maPhieuDatCho, hinhThucThanhToan, soTienThanhToan }
   → Thanh toán, vé chuyển sang HOP_LE

4. (optional) POST /api/baggage  { maVe, maBangGia, danhSachKien }
   → Thêm hành lý ký gửi

5. POST /api/checkin  { maVe, soGhe }   (trong cửa sổ 24h - 60ph trước bay)
   → Nhận boarding pass
```

### 19.2 Luồng nhân viên bán vé tại quầy

```
1. GET /api/flights/{id}  → Kiểm tra chuyến bay và số ghế còn

2. POST /api/tickets/sell  { maChuyenBay, maKhachHang, maHangVe }
   → Bán vé, nhận maVe

3. POST /api/payments  { maVe, hinhThucThanhToan: "CASH", soTienThanhToan }
   → Thu tiền, thanh toán hoàn tất
```

### 19.3 Luồng Admin quản lý

```
- GET  /api/accounts            → Danh sách tài khoản
- POST /api/accounts            → Tạo nhân viên/đại lý
- PUT  /api/accounts/{id}/status?active=false  → Khóa tài khoản

- GET  /api/config              → Xem cấu hình hệ thống
- PUT  /api/config/{key}        → Điều chỉnh tham số nghiệp vụ

- GET  /api/reports/monthly?year=2026&month=6  → Xem báo cáo
- GET  /api/reports/export?year=2026&month=6   → Tải Excel
```

---

## Environment Variables

| Biến | Default | Mô tả |
|---|---|---|
| `DB_HOST` | `localhost` | SQL Server hostname |
| `DB_PORT` | `1433` | SQL Server port |
| `DB_NAME` | `VeMayBayDB` | Database name |
| `DB_USER` | `vemaybay_app` | DB user (không dùng `sa`) |
| `DB_PASSWORD` | *(bắt buộc)* | DB password |
| `JWT_SECRET` | *(bắt buộc, ≥256 bit)* | JWT signing key |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `SERVER_PORT` | `8080` | HTTP port |

---

*Swagger UI đầy đủ tại: `http://localhost:8080/swagger-ui/index.html`*
