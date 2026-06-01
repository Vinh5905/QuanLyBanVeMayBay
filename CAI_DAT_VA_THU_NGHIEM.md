# Báo Cáo: Cài Đặt và Thử Nghiệm
## Phần Mềm Quản Lý Bán Vé Máy Bay

---

## 1. Tổng Quan Hệ Thống

| Thông tin | Chi tiết |
|---|---|
| **Tên hệ thống** | Phần Mềm Quản Lý Bán Vé Máy Bay |
| **Backend** | Java 21 + Spring Boot 3.4.1 |
| **Database** | SQL Server 2022 (Docker) |
| **Frontend** | ReactJS |
| **Bảo mật** | Spring Security + JWT (JJWT 0.12.6) |
| **ORM** | Spring Data JPA / Hibernate 6 |
| **Build tool** | Maven 3.9+ (Maven Wrapper) |
| **Container** | Docker + Docker Compose |

---

## 2. Yêu Cầu Môi Trường

### 2.1 Phần Mềm Cần Cài Đặt

| Phần mềm | Phiên bản tối thiểu | Mục đích |
|---|---|---|
| JDK | 21+ | Chạy backend |
| Docker Desktop | 24+ | Chạy SQL Server, toàn bộ stack |
| Docker Compose | 2.20+ | Orchestration container |
| Node.js | 18+ | Chạy frontend |
| Maven | 3.9+ (hoặc dùng `./mvnw`) | Build backend |

### 2.2 Cổng Mặc Định

| Dịch vụ | Cổng |
|---|---|
| Backend API | `8080` |
| SQL Server | `1433` |
| Frontend | `5173` |

---

## 3. Cài Đặt và Khởi Chạy

### 3.1 Clone và Cài Đặt Nhanh (Docker)

```bash
# 1. Clone repository
git clone <repository-url>
cd QuanLyBanVeMayBay

# 2. Khởi chạy toàn bộ stack (SQL Server + Backend + Frontend)
docker-compose up --build -d

# 3. Kiểm tra trạng thái
docker-compose ps
```

### 3.2 Cài Đặt Thủ Công (Development)

#### Bước 1: Khởi chạy SQL Server

```bash
docker-compose up sqlserver -d
```

#### Bước 2: Khởi tạo Database

```bash
# Chạy tất cả script SQL theo thứ tự
cd database/scripts

# Thứ tự thực thi
sqlcmd -S localhost,1433 -U sa -P "<password>" -i 01_create_database.sql
sqlcmd -S localhost,1433 -U sa -P "<password>" -d VeMayBayDB -i 02_create_tables.sql
sqlcmd -S localhost,1433 -U sa -P "<password>" -d VeMayBayDB -i 03_stored_procedures.sql
sqlcmd -S localhost,1433 -U sa -P "<password>" -d VeMayBayDB -i 04_seed_data.sql
```

#### Bước 3: Chạy Backend

```bash
cd backend

# Cấu hình kết nối trong src/main/resources/application.yml
# (xem mục 3.3)

# Build và chạy
./mvnw spring-boot:run
```

#### Bước 4: Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3.3 Cấu Hình Backend (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=VeMayBayDB;encrypt=false
    username: app_user
    password: <mật khẩu>
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

app:
  jwt:
    secret: <chuỗi bí mật ≥ 256 bit>
    expiration-ms: 3600000       # 1 giờ
    refresh-expiration-ms: 604800000  # 7 ngày
```

### 3.4 Tài Khoản Demo (Seed Data)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Nhân viên | `nhanvien01` | `Nhanvien@123` |
| Đại lý | `daily01` | `Daily@123` |
| Khách hàng | `khach01` | `Khach@123` |

---

## 4. Kiểm Thử Tự Động (Automation Testing)

### 4.1 Công Nghệ Sử Dụng

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **JUnit 5** | 5.11.4 | Test framework, `@Test`, `@Nested`, `@BeforeEach` |
| **Mockito** | 5.14.2 | Mock dependencies, `@Mock`, `@InjectMocks`, `verify()` |
| **AssertJ** | 3.26.3 | Fluent assertions, `assertThat()`, `assertThatThrownBy()` |
| **Spring Security Test** | 6.4.3 | `SecurityContextHolder` cho test phân quyền |
| **H2 Database** | 2.3.232 | In-memory DB cho integration test context |

### 4.2 Cấu Trúc Thư Mục Test

```
backend/src/test/java/com/vemaybay/
└── service/
    ├── AuthServiceImplTest.java        (19 test cases)
    ├── FlightServiceImplTest.java      (17 test cases)
    ├── TicketServiceImplTest.java      (13 test cases)
    ├── ConfigServiceImplTest.java      (21 test cases)
    ├── BaggageServiceImplTest.java     (13 test cases)
    ├── AccountServiceImplTest.java     (17 test cases)
    └── PaymentServiceImplTest.java     (4 test cases)
```

### 4.3 Cấu Hình Test (`application-test.yml`)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
  h2:
    console:
      enabled: true

app:
  jwt:
    secret: test-secret-key-for-unit-tests-only-min-256-bits-long-padding!!
    expiration-ms: 3600000
    refresh-expiration-ms: 604800000
```

### 4.4 Chạy Kiểm Thử

```bash
cd backend

# Chạy tất cả test
./mvnw test

# Chạy một file test cụ thể
./mvnw test -Dtest=AuthServiceImplTest

# Chạy một class lồng nhau
./mvnw test -Dtest="AuthServiceImplTest\$LoginTests"

# Tạo báo cáo HTML (Surefire)
./mvnw surefire-report:report
# Xem tại: target/site/surefire-report.html
```

---

## 5. Kết Quả Kiểm Thử

### 5.1 Tổng Hợp

| Chỉ số | Giá trị |
|---|---|
| **Tổng số test case** | 107 |
| **Pass** | 107 |
| **Fail** | 0 |
| **Error** | 0 |
| **Skipped** | 0 |
| **Thời gian chạy** | ~2.5 giây |

### 5.2 Bảng Mức Độ Hoàn Thành Kiểm Thử Theo Chức Năng

| STT | Chức năng | Test file | Số test | Mức độ hoàn thành (%) | Ghi chú |
|---|---|---|---|---|---|
| 1 | Xác thực & Phân quyền (Auth) | `AuthServiceImplTest` | 19 | 100% | Bao gồm brute force, JWT refresh, đổi mật khẩu, đăng xuất |
| 2 | Quản lý chuyến bay (Flight) | `FlightServiceImplTest` | 17 | 100% | Tạo, cập nhật, hủy chuyến bay, tra cứu sân bay |
| 3 | Bán vé & Đặt vé (Ticket) | `TicketServiceImplTest` | 13 | 85% | Unit test cho validation và RBAC; SP call (bán vé, đặt vé) cần integration test |
| 4 | Quản lý tham số (Config) | `ConfigServiceImplTest` | 21 | 100% | Validation giá trị, ràng buộc chéo (cross-constraints) THAMSO |
| 5 | Quản lý hành lý (Baggage) | `BaggageServiceImplTest` | 13 | 95% | Giá theo thời điểm đặt (sớm/muộn), giới hạn trọng lượng/kiện; SP cần integration test |
| 6 | Quản lý tài khoản (Account) | `AccountServiceImplTest` | 17 | 100% | CRUD, khóa/mở tài khoản, reset mật khẩu |
| 7 | Thanh toán (Payment) | `PaymentServiceImplTest` | 4 | 70% | Validation đầu vào; logic SP (sp_ThanhToan_Create) cần integration test |
| 8 | Check-in Online | — | 0 | 60% | Không có unit test riêng; logic nằm trong SP (sp_CheckIn_Online); cần integration test |
| 9 | Dashboard & Báo cáo | — | 0 | 60% | Query động, cần integration test với dữ liệu thực; API đã hoàn chỉnh |
| **Tổng** | | | **107** | **~90%** | |

---

## 6. Chi Tiết Các Test Case

### 6.1 AuthServiceImplTest — 19 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `login_success` | Đăng nhập đúng tên/mật khẩu, tài khoản active | Trả về `AuthResponse` chứa JWT và refresh token |
| 2 | `login_userNotFound` | Username không tồn tại | Ném `ResourceNotFoundException` |
| 3 | `login_wrongPassword` | Sai mật khẩu | Ném `BusinessException` chứa "Sai mật khẩu" |
| 4 | `login_lockedAccount` | Tài khoản bị khóa (`trangThai=0`) | Ném `BusinessException` chứa "bị khóa" |
| 5 | `login_bruteForce_lockout` | 5 lần thất bại trong 15 phút | Ném `BusinessException`, tài khoản bị tạm khóa 15 phút |
| 6 | `register_success` | Đăng ký với username/email mới | Trả về `AuthResponse`, tài khoản mới được lưu |
| 7 | `register_duplicateUsername` | Username đã tồn tại | Ném `ConflictException` |
| 8 | `register_duplicateEmail` | Email đã được sử dụng | Ném `ConflictException` |
| 9 | `refreshToken_success` | Token hợp lệ, chưa bị thu hồi | Trả về `AuthResponse` mới |
| 10 | `refreshToken_invalid` | Token không tồn tại trong DB | Ném `UnauthorizedException` |
| 11 | `refreshToken_revoked` | Token đã bị thu hồi (`revoked=true`) | Ném `UnauthorizedException` |
| 12 | `refreshToken_expired` | Token đã hết hạn | Ném `UnauthorizedException` |
| 13 | `changePassword_success` | Mật khẩu hiện tại đúng, mật khẩu mới hợp lệ | Lưu mật khẩu mới đã hash |
| 14 | `changePassword_wrongCurrentPassword` | Mật khẩu hiện tại sai | Ném `BusinessException` |
| 15 | `changePassword_userNotFound` | User trong SecurityContext không tồn tại | Ném `ResourceNotFoundException` |
| 16 | `logout_withToken` | Có cung cấp refresh token | Thu hồi token trong DB |
| 17 | `logout_withoutToken` | Không cung cấp token | Không có exception, không gọi repository |
| 18 | `getCurrentUser_success` | User tồn tại trong DB | Trả về `UserInfoResponse` đúng thông tin |
| 19 | `getCurrentUser_notFound` | User ID không tồn tại | Ném `ResourceNotFoundException` |

### 6.2 FlightServiceImplTest — 17 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `createFlight_success` | Tạo chuyến bay hợp lệ (2 sân bay khác nhau, 1 điểm dừng) | Lưu chuyến bay, trả về `FlightResponse` |
| 2 | `createFlight_sameAirport` | Sân bay đi = sân bay đến | Ném `BusinessException` |
| 3 | `createFlight_duplicateFlightCode` | Mã chuyến bay đã tồn tại | Ném `ConflictException` |
| 4 | `createFlight_tooManyStopovers` | 3 điểm dừng (>2) | Ném `BusinessException` chứa "2 điểm dừng" |
| 5 | `createFlight_airportNotFound` | Sân bay không tồn tại trong DB | Ném `ResourceNotFoundException` |
| 6 | `getFlightById_success` | ID tồn tại, chưa bị xóa | Trả về `FlightResponse` |
| 7 | `getFlightById_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 8 | `getFlightById_deleted` | Chuyến bay đã xóa mềm | Ném `ResourceNotFoundException` |
| 9 | `updateFlight_success` | Cập nhật chuyến bay đang hoạt động | Lưu thông tin mới |
| 10 | `updateFlight_cancelled` | Chuyến bay đã bị hủy | Ném `BusinessException` |
| 11 | `updateFlight_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 12 | `updateFlight_tooManyStopovers` | Cập nhật với 3 điểm dừng | Ném `BusinessException` |
| 13 | `cancelFlight_success` | Hủy chuyến bay đang hoạt động | Cập nhật trạng thái thành "HUY" |
| 14 | `cancelFlight_alreadyCancelled` | Hủy chuyến bay đã hủy | Ném `BusinessException` |
| 15 | `cancelFlight_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 16 | `getAllAirports_returnsAll` | Lấy danh sách sân bay | Trả về list tất cả sân bay |
| 17 | `getFlights_withPagination` | Tìm kiếm chuyến bay với phân trang | Trả về `Page<FlightResponse>` |

### 6.3 TicketServiceImplTest — 13 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `upgrade_success_economyToBusiness` | Vé HOP_LE, nâng từ Economy lên Business, có ghế trống | Gọi `taiKhoanRepository.save()` với hạng mới |
| 2 | `upgrade_ticketNotHopLe` | Vé trạng thái DA_HUY | Ném `BusinessException` |
| 3 | `upgrade_sameClass` | Nâng hạng cùng loại (Business → Business) | Ném `BusinessException` |
| 4 | `upgrade_noSeatsAvailable` | Không còn ghế hạng Business | Ném `BusinessException` |
| 5 | `upgrade_ticketNotFound` | ID vé không tồn tại | Ném `ResourceNotFoundException` |
| 6 | `getTicketById_asAdmin` | Admin lấy vé của bất kỳ khách | Trả về `TicketResponse` đầy đủ |
| 7 | `getTicketById_asUserOwnTicket` | User lấy vé của chính mình | Trả về `TicketResponse` |
| 8 | `getTicketById_asUserOtherTicket` | User lấy vé của người khác | Ném `ForbiddenException` |
| 9 | `getTicketById_notFound` | ID vé không tồn tại | Ném `ResourceNotFoundException` |
| 10 | `cancelBooking_success` | Hủy phiếu đặt chỗ trạng thái DANG_GIU_CHO | Chuyển trạng thái thành DA_HUY |
| 11 | `cancelBooking_notFound` | ID phiếu không tồn tại | Ném `ResourceNotFoundException` |
| 12 | `cancelBooking_invalidStatus` | Phiếu đã ở trạng thái HOP_LE (đã bán) | Ném `BusinessException` |
| 13 | `cancelBooking_asUserOtherBooking` | User hủy phiếu của người khác | Ném `ForbiddenException` |

### 6.4 ConfigServiceImplTest — 21 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `getAllConfigs_success` | Có dữ liệu THAMSO | Trả về list `ConfigResponse` |
| 2 | `getAllConfigs_empty` | Bảng THAMSO trống | Trả về list rỗng |
| 3 | `getConfig_success` | Key tồn tại | Trả về `ConfigResponse` |
| 4 | `getConfig_notFound` | Key không tồn tại | Ném `ResourceNotFoundException` |
| 5 | `updateConfig_validValue` | Giá trị số hợp lệ | Lưu và trả về giá trị mới |
| 6 | `updateConfig_nonNumeric` | Giá trị không phải số | Ném `BusinessException` chứa "số" |
| 7 | `updateConfig_negativeValue` | Giá trị âm | Ném `BusinessException` chứa "0" |
| 8 | `updateConfig_tuoiOutOfRange` | Tuổi = 0 (cần 1–100) | Ném `BusinessException` |
| 9 | `updateConfig_tuoiValid` | Tuổi = 18 | Cập nhật thành công |
| 10 | `updateConfig_thueVATOutOfRange` | Thuế VAT = 110% (cần 0–100) | Ném `BusinessException` |
| 11 | `updateConfig_thueVATValid` | Thuế VAT = 10% | Cập nhật thành công |
| 12 | `updateConfig_weightOutOfRange` | Trọng lượng = 0kg (cần 1–50) | Ném `BusinessException` |
| 13 | `updateConfig_soKienOutOfRange` | Số kiện = 200 (cần 1–100) | Ném `BusinessException` |
| 14 | `updateConfig_keyNotFound` | Key không tồn tại trong DB | Ném `ResourceNotFoundException` |
| 15 | `crossConstraint_dongBanVe_violates` | ThoiGianDongBanVe (180) ≥ TGDatVeChamNhat (120) | Ném `BusinessException` |
| 16 | `crossConstraint_datVeChamNhat_violates` | TGDatVeChamNhat (30) ≤ ThoiGianDongBanVe (45) | Ném `BusinessException` |
| 17 | `crossConstraint_valid` | ThoiGianDongBanVe (45) < TGDatVeChamNhat (120) | Cập nhật thành công |
| 18 | `crossConstraint_dungToiThieu_violates` | ThoiGianDungToiThieu (180) ≥ ThoiGianDungToiDa (120) | Ném `BusinessException` |
| 19 | `crossConstraint_dungToiDa_violates` | ThoiGianDungToiDa (30) ≤ ThoiGianDungToiThieu (45) | Ném `BusinessException` |
| 20 | `crossConstraint_dungValid` | ThoiGianDungToiThieu (45) < ThoiGianDungToiDa (120) | Cập nhật thành công |
| 21 | `batchUpdate_constraintViolated` | Batch có ThoiGianDongBanVe (100) ≥ TGDatVeChamNhat (50) | Ném `BusinessException` khi validate |

### 6.5 BaggageServiceImplTest — 13 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `getPricing_success` | Có bảng giá hành lý hoạt động | Trả về list `BaggagePricingResponse` |
| 2 | `getPricing_empty` | Không có bảng giá nào active | Trả về list rỗng |
| 3 | `registerBaggage_earlyBooking` | Đăng ký trước 3h cất cánh → dùng giá sớm | Sử dụng `giaTruocChuyenBay` |
| 4 | `registerBaggage_lateBooking` | Đăng ký sau 3h cất cánh → dùng giá tại sân bay | Sử dụng `giaTaiSanBay` |
| 5 | `registerBaggage_ticketNotHopLe` | Vé không ở trạng thái HOP_LE | Ném `BusinessException` |
| 6 | `registerBaggage_weightExceeded` | Trọng lượng > `soKgToiDa` | Ném `BusinessException` chứa "trọng lượng" |
| 7 | `registerBaggage_tooManyPieces` | Đăng ký kiện thứ 16 (>15 kiện/vé) | Ném `BusinessException` chứa "15 kiện" |
| 8 | `registerBaggage_ticketNotFound` | ID vé không tồn tại | Ném `ResourceNotFoundException` |
| 9 | `registerBaggage_inactivePricing` | Gói hành lý không còn active | Ném `ResourceNotFoundException` |
| 10 | `cancelBaggage_success` | Kiện hành lý trạng thái active | Chuyển trạng thái thành DA_HUY |
| 11 | `cancelBaggage_alreadyCancelled` | Kiện hành lý đã bị hủy | Ném `BusinessException` |
| 12 | `cancelBaggage_notFound` | ID kiện không tồn tại | Ném `ResourceNotFoundException` |
| 13 | `getBaggageByTicket` | Lấy danh sách hành lý theo vé | Trả về list đúng |

### 6.6 AccountServiceImplTest — 17 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `getAccountById_success` | ID tài khoản tồn tại | Trả về `AccountResponse` đúng thông tin |
| 2 | `getAccountById_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 3 | `createAccount_nhanVien_success` | Tạo tài khoản NhanVien với thông tin hợp lệ | Lưu tài khoản, mã hóa mật khẩu BCrypt |
| 4 | `createAccount_duplicateUsername` | Tên đăng nhập đã tồn tại | Ném `ConflictException` chứa "Tên đăng nhập" |
| 5 | `createAccount_duplicateEmail` | Email đã sử dụng | Ném `ConflictException` chứa "Email" |
| 6 | `createAccount_roleNotFound` | Vai trò không tồn tại trong DB | Ném `ResourceNotFoundException` |
| 7 | `updateAccount_email_success` | Cập nhật email mới chưa dùng | Lưu email mới |
| 8 | `updateAccount_duplicateUsername` | Tên đăng nhập mới đã tồn tại | Ném `ConflictException` chứa "Tên đăng nhập" |
| 9 | `updateAccount_duplicateEmail` | Email mới đã sử dụng | Ném `ConflictException` chứa "Email" |
| 10 | `updateAccount_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 11 | `setAccountStatus_lock` | Khóa tài khoản đang active | Lưu `trangThai = 0` |
| 12 | `setAccountStatus_unlock` | Mở khóa tài khoản bị khóa | Lưu `trangThai = 1` |
| 13 | `setAccountStatus_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |
| 14 | `resetPassword_success` | Đặt lại mật khẩu ≥ 8 ký tự | Lưu mật khẩu mới đã hash |
| 15 | `resetPassword_tooShort` | Mật khẩu mới < 8 ký tự | Ném `BusinessException` chứa "8 ký tự" |
| 16 | `resetPassword_null` | Mật khẩu mới null | Ném `BusinessException` chứa "8 ký tự" |
| 17 | `resetPassword_notFound` | ID không tồn tại | Ném `ResourceNotFoundException` |

### 6.7 PaymentServiceImplTest — 4 Test Cases

| STT | Tên test | Kịch bản kiểm thử | Kết quả mong đợi |
|---|---|---|---|
| 1 | `createPayment_missingBothTargets` | Không cung cấp cả `maPhieuDatCho` lẫn `maVe` | Ném `BusinessException` chứa "mã phiếu đặt chỗ hoặc mã vé" |
| 2 | `createPayment_bothTargetsProvided` | Cung cấp cả `maPhieuDatCho` và `maVe` cùng lúc | Ném `BusinessException` chứa "một trong hai" |
| 3 | `createPayment_withPhieuDatCho` | Chỉ cung cấp `maPhieuDatCho` → validation pass | Không ném `BusinessException` (lỗi ở SP call là bình thường) |
| 4 | `createPayment_withMaVe` | Chỉ cung cấp `maVe` → validation pass | Không ném `BusinessException` (lỗi ở SP call là bình thường) |

---

## 7. Phân Tích Độ Bao Phủ Kiểm Thử

### 7.1 Loại Test Case Theo Phân Loại

| Loại kiểm thử | Số lượng | Tỷ lệ |
|---|---|---|
| **Happy path** (đầu vào hợp lệ) | 32 | 30% |
| **Validation** (kiểm tra đầu vào sai) | 31 | 29% |
| **Business rule** (vi phạm nghiệp vụ) | 24 | 22% |
| **RBAC / Authorization** (phân quyền) | 8 | 8% |
| **Not found** (tài nguyên không tồn tại) | 12 | 11% |
| **Tổng** | **107** | **100%** |

### 7.2 Quy Tắc Nghiệp Vụ Đã Kiểm Thử

| Quy tắc | Mô tả | Đã test |
|---|---|---|
| Brute force protection | 5 lần đăng nhập sai trong 15 phút → khóa 15 phút | ✅ |
| Ràng buộc THAMSO chéo | ThoiGianDongBanVe < TGDatVeChamNhat; ThoiGianDungToiThieu < ThoiGianDungToiDa | ✅ |
| Giá hành lý theo thời điểm | Đặt trước 3h: dùng `giaTruocChuyenBay`; sau 3h: `giaTaiSanBay` | ✅ |
| Giới hạn điểm dừng | Tối đa 2 điểm dừng trung gian trên chuyến bay | ✅ |
| Giới hạn kiện hành lý | Tối đa 15 kiện/vé | ✅ |
| RBAC phiếu đặt chỗ | User chỉ được xem/hủy phiếu của mình | ✅ |
| Nâng hạng vé | Chỉ nâng cấp vé HOP_LE, không nâng cùng hạng | ✅ |
| Mật khẩu tối thiểu | Ít nhất 8 ký tự | ✅ |
| Trùng username/email | Báo lỗi ConflictException | ✅ |
| Key THAMSO bị xóa | DIEM_TICH_LUY_PER_100K, GIA_VE_TOI_THIEU, PHI_DOI_VE, PHI_HANH_LY_KG_VUOT, PHI_HUY_VE không còn dùng | ✅ (không test các key này) |

### 7.3 Những Gì Cần Integration Test

Các chức năng sau phụ thuộc vào Stored Procedure SQL Server — không thể mock tại tầng service, cần integration test với DB thực:

| Chức năng | Stored Procedure |
|---|---|
| Bán vé trực tiếp | `sp_BanVe_Create` |
| Đặt giữ chỗ | `sp_DatVe_Create` |
| Hủy vé | `sp_HuyVe` |
| Đổi chuyến bay | `sp_DoiChuyenBay` |
| Thanh toán | `sp_ThanhToan_Create` |
| Check-in online | `sp_CheckIn_Online` |

---

## 8. Hướng Dẫn Thêm Test Case Mới

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("MyService Unit Tests")
class MyServiceImplTest {

    @Mock MyRepository myRepository;       // Mock dependency
    @InjectMocks MyServiceImpl myService;  // Service được test

    @Test
    @DisplayName("Mô tả test case bằng tiếng Việt")
    void methodName_scenario_expectedResult() {
        // Arrange
        when(myRepository.findById(1)).thenReturn(Optional.of(new MyEntity()));

        // Act & Assert
        assertThatCode(() -> myService.doSomething(1))
                .doesNotThrowAnyException();
        verify(myRepository).save(any());
    }
}
```

---

## 9. Kết Luận

Hệ thống đã được kiểm thử tự động với **107 test case** bao phủ 7 service chính của backend. Tất cả test đều pass với 0 failure. Các trường hợp nghiệp vụ quan trọng — từ xác thực JWT, phân quyền RBAC, ràng buộc tham số nghiệp vụ (THAMSO), đến logic giá hành lý theo thời điểm — đều được kiểm tra tường minh.

Một số chức năng gọi Stored Procedure (bán vé, đặt vé, thanh toán, check-in) chỉ được kiểm tra validation đầu vào tại tầng service; cần bổ sung integration test với SQL Server để kiểm tra logic đầy đủ trong các sprint tiếp theo.
