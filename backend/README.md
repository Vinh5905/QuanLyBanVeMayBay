# VeMayBay Backend

Spring Boot REST API cho Hệ thống Quản lý Bán Vé Máy Bay.

## Tech Stack

- Java 21
- Spring Boot 3.4.1
- Spring Security + JWT
- Spring Data JPA
- SQL Server (Docker)
- Swagger/OpenAPI 3.0
- MapStruct + Lombok

## Chạy local

### Yêu cầu
- Java 21+
- Docker (cho SQL Server)

### Bước 1: Start database
```bash
# Từ thư mục root project
docker-compose up -d sqlserver sqlserver-init
```

### Bước 2: Start backend
```bash
cd backend
./mvnw spring-boot:run
```

### Bước 3: Truy cập
- API Health: http://localhost:8080/api/health
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Actuator: http://localhost:8080/actuator/health

## Chạy với Docker
```bash
# Từ thư mục root project
docker-compose up -d
```

## Chạy tests
```bash
cd backend
./mvnw test
```

## Cấu trúc project
```
src/main/java/com/vemaybay/
├── config/        # Security, CORS, Swagger config
├── controller/    # REST Controllers
├── service/       # Business logic
├── repository/    # JPA Repositories
├── entity/        # JPA Entities
├── dto/           # Request/Response DTOs
├── mapper/        # MapStruct mappers
├── exception/     # Custom exceptions + Global handler
├── security/      # JWT filter, UserDetails
└── util/          # Helper classes
```

## Environment Variables

| Variable | Default | Mô tả |
|----------|---------|--------|
| DB_HOST | localhost | SQL Server host |
| DB_PORT | 1433 | SQL Server port |
| DB_NAME | VeMayBayDB | Database name |
| DB_USER | vemaybay_app | Database user |
| DB_PASSWORD | - | Database password |
| JWT_SECRET | - | JWT signing key (min 256 bits) |
| CORS_ORIGINS | http://localhost:3000 | Allowed CORS origins |
| SERVER_PORT | 8080 | Backend port |

## Response Format

Tất cả API trả về format thống nhất:

```json
{
  "status": "success|error",
  "code": 200,
  "message": "Thành công",
  "data": {},
  "pagination": { "page": 0, "size": 20, "totalElements": 100, "totalPages": 5 },
  "errors": [{ "field": "email", "message": "Email không hợp lệ" }],
  "timestamp": "2025-01-01T10:30:00",
  "requestId": "uuid-v4"
}
```

## Lưu ý bảo mật

- Backend kết nối SQL Server bằng tài khoản `vemaybay_app`, KHÔNG dùng `sa`
- Password hash bằng BCrypt (strength 12)
- JWT token cho authentication
- CORS chỉ cho phép origin được cấu hình
