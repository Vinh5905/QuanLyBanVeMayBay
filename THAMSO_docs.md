# 📋 Tài liệu Bảng Tham Số Hệ Thống – THAM_SO

> **Mục đích tài liệu:** Mô tả ý nghĩa, giá trị mặc định, nguồn quy định và logic nghiệp vụ của từng tham số cấu hình trong hệ thống quản lý vé máy bay.  
> **Đối tượng đọc:** Quản trị viên hệ thống, Developer backend, AI Agent tích hợp nghiệp vụ.

---

## 🚨 Biến đã bị loại bỏ – Xóa khỏi DB, code và test

> Các key dưới đây **không thuộc thiết kế `THAM_SO`** và đã bị loại bỏ hoàn toàn. Developer và AI Agent **không được đọc, tham chiếu, hay tái tạo** bất kỳ logic nào liên quan đến chúng.

| Key bị xóa | Lý do |
|---|---|
| `DIEM_TICH_LUY_PER_100K` | Không có trong thiết kế `THAM_SO`; logic điểm tích lũy không thuộc phạm vi bảng tham số này |
| `GIA_VE_TOI_THIEU` | Không có trong thiết kế `THAM_SO`; giá vé được kiểm soát qua `GiaCoBan` trong `CHUYENBAY` |
| `PHI_DOI_VE` | Không có trong thiết kế `THAM_SO`; phí đổi vé là hằng số nghiệp vụ, không phải tham số cấu hình động |
| `PHI_HANH_LY_KG_VUOT` | Không có trong thiết kế `THAM_SO`; phí vượt ký lưu trong `KIENHANHLY.PhuPhiQuaCan`, tính ngoài bảng tham số |
| `PHI_HUY_VE` | Không có trong thiết kế `THAM_SO`; phí hủy vé là hằng số nghiệp vụ, không phải tham số cấu hình động |

**Yêu cầu bắt buộc với Developer / Agent khi đọc tài liệu này:**

1. **Xóa khỏi DB:** Chạy `DELETE FROM THAM_SO WHERE TenThamSo IN (...)` (xem script migration ở cuối tài liệu).
2. **Xóa khỏi code:** Tìm và xóa toàn bộ các đoạn `SELECT ... FROM APP_CONFIG/CAUHINH/THAM_SO WHERE ... = 'DIEM_TICH_LUY_PER_100K'` (và 4 key còn lại). Xóa luôn các biến, hàm, service method đang đọc các key này.
3. **Xóa khỏi test:** Xóa toàn bộ test case, mock data, seed data, fixture có tham chiếu đến 5 key trên. Không viết test mới cho chúng.
4. **Không thay thế bằng hardcode:** Các phí/giá trị này nếu cần dùng thì phải được tái thiết kế ở tầng nghiệp vụ riêng (service/config riêng), không nhét vào `THAM_SO` dưới tên mới.

---

## 🗂️ Cấu trúc bảng `THAM_SO`

> ⚠️ **Đổi tên bảng:** Bảng cấu hình trước đây tên `APP_CONFIG` (hoặc `CAUHINH`) nay được **đổi thành `THAM_SO`** thống nhất trong toàn bộ codebase. Cần cập nhật tất cả `FROM APP_CONFIG` → `FROM THAM_SO` trong code và migration script.

```sql
-- Migration: đổi tên bảng
EXEC sp_rename 'APP_CONFIG', 'THAM_SO';
-- Hoặc nếu tên là CAUHINH:
EXEC sp_rename 'CAUHINH', 'THAM_SO';
```

Mỗi dòng trong `THAM_SO` là một tham số điều khiển một quy tắc hoặc ngưỡng nghiệp vụ.

| Cột | Kiểu | Ý nghĩa |
|-----|------|---------|
| `TenThamSo` | VARCHAR(100) | Tên tham số – khóa tra cứu, duy nhất |
| `GiaTri` | NVARCHAR(255) | Giá trị hiện tại (luôn lưu dạng chuỗi, ép kiểu khi dùng) |
| `MoTa` | NVARCHAR(500) | Mô tả ngắn gọn mục đích tham số |
| `CapNhatBoi` | INT / FK | ID nhân viên cập nhật cuối |
| `CapNhatLuc` | DATETIME | Thời điểm cập nhật cuối |

---

## ⚠️ Ràng buộc liên tham số quan trọng

Một số tham số có mối ràng buộc với nhau. Hệ thống **phải kiểm tra** các bất biến này mỗi khi admin cập nhật giá trị qua giao diện quản trị:

| Ràng buộc | Điều kiện bắt buộc | Lý do |
|---|---|---|
| Cửa sổ bán vé | `ThoiGianDongBanVe` < `TGDatVeChamNhat` | Quầy sân bay đóng bán sớm hơn app; phải đảm bảo app vẫn còn hạn đặt sau khi quầy đóng |
| Cửa sổ dừng sân bay TG | `ThoiGianDungToiThieu` < `ThoiGianDungToiDa` | Khoảng [min, max] phải hợp lệ |
| Cửa sổ check-in online | `ThoiGianDongCheckInOnline` < `ThoiGianMoCheckInOnline` × 60 | Cổng check-in phải đóng trước khi mở |

```sql
-- Trigger hoặc stored procedure kiểm tra khi UPDATE THAM_SO
-- Ví dụ kiểm tra ràng buộc ThoiGianDongBanVe < TGDatVeChamNhat
DECLARE @dongBanVe INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDongBanVe');
DECLARE @datVeChamNhat INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'TGDatVeChamNhat');
IF @dongBanVe >= @datVeChamNhat * 60  -- đổi về cùng đơn vị phút
    RAISERROR(N'Vi phạm ràng buộc: ThoiGianDongBanVe phải nhỏ hơn TGDatVeChamNhat', 16, 1);
```

---

## 📌 Chi tiết từng tham số

---

### 1. `TuoiMuaVeToiThieu`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `TuoiMuaVeToiThieu` |
| **Giá trị mặc định** | `18` |
| **Đơn vị** | Tuổi (năm) |
| **Quy định nguồn** | QĐ1 |

**Ý nghĩa cho người dùng:**  
Khách hàng phải đủ 18 tuổi mới được tự đăng ký tài khoản và đặt vé trên hệ thống. Trẻ em hoặc khách dưới 18 tuổi cần đặt vé qua người lớn đi cùng hoặc đại lý.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT KHACHHANG` (đăng ký) và khi `INSERT PHIEUDATCHO` / `INSERT VE` (đặt vé):

```sql
-- Hàm kiểm tra tuổi hợp lệ
DECLARE @tuoiToiThieu INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'TuoiMuaVeToiThieu');
DECLARE @tuoiKhachHang INT = DATEDIFF(YEAR, @NgaySinh, GETDATE())
    - CASE WHEN (MONTH(@NgaySinh) > MONTH(GETDATE()))
            OR (MONTH(@NgaySinh) = MONTH(GETDATE()) AND DAY(@NgaySinh) > DAY(GETDATE()))
           THEN 1 ELSE 0 END;
-- Nếu @tuoiKhachHang < @tuoiToiThieu → RAISERROR, rollback
```

- Dùng phép tính chính xác (trừ 1 nếu sinh nhật chưa qua trong năm) thay vì `DATEDIFF(YEAR,...)` thuần vì DATEDIFF chỉ so năm, không so ngày-tháng.
- **Bảng tham chiếu:** `KHACHHANG.NgaySinh`

---

### 2. `ThoiGianBayToiThieu`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianBayToiThieu` |
| **Giá trị mặc định** | `30` |
| **Đơn vị** | Phút |
| **Quy định nguồn** | QĐ2 |

**Ý nghĩa cho người dùng:**  
Mỗi chuyến bay phải có thời gian bay ít nhất 30 phút (từ điểm đi đến điểm đến, không tính dừng trung gian). Không thể tạo chuyến bay quá ngắn.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT` hoặc `UPDATE CHUYENBAY`:

```sql
DECLARE @tgBayMin INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianBayToiThieu');
IF @ThoiGianBay < @tgBayMin
    RAISERROR(N'Thời gian bay không được dưới %d phút.', 16, 1, @tgBayMin);
```

- **Bảng tham chiếu:** `CHUYENBAY.ThoiGianBay`

---

### 3. `SoSanBayTrungGianToiDa`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `SoSanBayTrungGianToiDa` |
| **Giá trị mặc định** | `2` |
| **Đơn vị** | Sân bay (điểm dừng) |
| **Quy định nguồn** | QĐ2 |

**Ý nghĩa cho người dùng:**  
Mỗi chuyến bay chỉ được dừng tối đa 2 sân bay trung gian (quá cảnh). Hành trình có hơn 2 điểm dừng sẽ bị hệ thống từ chối.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT TRUNGGIAN` (thêm điểm dừng mới cho một chuyến bay):

```sql
DECLARE @maxTG INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'SoSanBayTrungGianToiDa');
DECLARE @soTGHienTai INT = (SELECT COUNT(*) FROM TRUNGGIAN WHERE MaChuyenBay = @MaChuyenBay);
IF @soTGHienTai >= @maxTG
    RAISERROR(N'Chuyến bay đã đạt tối đa %d sân bay trung gian.', 16, 1, @maxTG);
```

- **Bảng tham chiếu:** `TRUNGGIAN.MaChuyenBay`

---

### 4. `ThoiGianDungToiThieu`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianDungToiThieu` |
| **Giá trị mặc định** | `45` |
| **Đơn vị** | Phút |
| **Quy định nguồn** | QĐ2 |

**Ý nghĩa cho người dùng:**  
Thời gian dừng tại mỗi sân bay trung gian phải ít nhất 45 phút để đảm bảo hành khách và hành lý kịp kết nối chuyến.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT` hoặc `UPDATE TRUNGGIAN`, phải thỏa đồng thời cả min và max:

```sql
DECLARE @tgDungMin INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDungToiThieu');
DECLARE @tgDungMax INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDungToiDa');
IF @ThoiGianDung < @tgDungMin OR @ThoiGianDung > @tgDungMax
    RAISERROR(N'Thời gian dừng phải từ %d đến %d phút.', 16, 1, @tgDungMin, @tgDungMax);
```

- Phối hợp kiểm tra cùng `ThoiGianDungToiDa` trong một điều kiện duy nhất.
- **Bảng tham chiếu:** `TRUNGGIAN.ThoiGianDung`

---

### 5. `ThoiGianDungToiDa`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianDungToiDa` |
| **Giá trị mặc định** | `120` |
| **Đơn vị** | Phút |
| **Quy định nguồn** | QĐ2 |

**Ý nghĩa cho người dùng:**  
Thời gian dừng tại mỗi sân bay trung gian không được vượt quá 2 giờ (120 phút). Nếu dừng lâu hơn phải tách thành chuyến bay riêng.

**Logic nghiệp vụ cho Agent/Developer:**  
Dùng chung điều kiện kiểm tra với `ThoiGianDungToiThieu` (xem mục 4):

```sql
-- Khoảng hợp lệ: 45 <= ThoiGianDung <= 120
-- Nếu vi phạm → RAISERROR như trên
```

- **Bảng tham chiếu:** `TRUNGGIAN.ThoiGianDung`

---

### 6. `ThoiGianDongBanVe`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianDongBanVe` |
| **Giá trị mặc định** | `45` |
| **Đơn vị** | Phút (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ3 |

**Ý nghĩa cho người dùng:**  
Quầy bán vé tại sân bay ngừng nhận khách **trước giờ khởi hành 45 phút**. Đây là mốc đóng cửa của kênh bán **trực tiếp tại quầy** (không áp dụng cho kênh app/online – xem `TGDatVeChamNhat`).

> ⚠️ **Ràng buộc bắt buộc:** `ThoiGianDongBanVe` (45 phút) **phải nhỏ hơn** `TGDatVeChamNhat` (120 phút). Nếu admin chỉnh sửa một trong hai giá trị, hệ thống phải kiểm tra lại bất biến này.

**Logic nghiệp vụ cho Agent/Developer:**  
Áp dụng khi nhân viên quầy tạo `VE` trực tiếp (không qua `PHIEUDATCHO`):

```sql
DECLARE @dongBanVe INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDongBanVe');
-- Kiểm tra: giờ hiện tại phải trước (NgayGioBay - 45 phút)
IF GETDATE() >= DATEADD(MINUTE, -@dongBanVe, @NgayGioBay)
    RAISERROR(N'Quầy vé đã đóng. Không thể bán vé trong vòng %d phút trước khởi hành.', 16, 1, @dongBanVe);
```

- Không áp dụng cho luồng đặt vé qua app (luồng app dùng `TGDatVeChamNhat`).
- **Bảng tham chiếu:** `CHUYENBAY.NgayGioBay`, `VE.NgayGiaoDich`

---

### 7. `TGDatVeChamNhat`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `TGDatVeChamNhat` |
| **Giá trị mặc định** | `120` |
| **Đơn vị** | Phút (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ3 |

**Ý nghĩa cho người dùng:**  
Khách hàng đặt vé qua **app / website** phải đặt trước giờ khởi hành ít nhất 2 tiếng (120 phút). Sau mốc này, toàn bộ tính năng đặt vé online bị khóa.

> ⚠️ **Ràng buộc với `ThoiGianDongBanVe`:** `TGDatVeChamNhat` (120 phút) **phải lớn hơn** `ThoiGianDongBanVe` (45 phút). Logic kiểm tra:

```sql
-- Kiểm tra ràng buộc khi admin UPDATE THAM_SO
DECLARE @dongBanVe INT   = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDongBanVe');
DECLARE @datChamNhat INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'TGDatVeChamNhat');
IF @dongBanVe >= @datChamNhat
    RAISERROR(N'ThoiGianDongBanVe (%d phút) phải nhỏ hơn TGDatVeChamNhat (%d phút).', 16, 1, @dongBanVe, @datChamNhat);
```

**Logic nghiệp vụ khi đặt vé online:**  
Kiểm tra khi `INSERT PHIEUDATCHO` (đặt chỗ qua app/web):

```sql
DECLARE @datChamNhat INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'TGDatVeChamNhat');
IF GETDATE() >= DATEADD(MINUTE, -@datChamNhat, @NgayGioBay)
    RAISERROR(N'Không thể đặt vé. Chỉ cho phép đặt trước %d phút so với giờ khởi hành.', 16, 1, @datChamNhat);
```

- Ngoài ra, batch job cuối ngày tự động hủy `PHIEUDATCHO` có `TrangThai = 'Đang giữ chỗ'` khi chuyến bay đã khởi hành.
- **Bảng tham chiếu:** `CHUYENBAY.NgayGioBay`, `PHIEUDATCHO.NgayDat`, `PHIEUDATCHO.TrangThai`

---

### 8. `TGHuyChamNhat`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `TGHuyChamNhat` |
| **Giá trị mặc định** | `0` |
| **Đơn vị** | Phút (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ6.3 |

**Ý nghĩa cho người dùng:**  
Vé được hủy bất kỳ lúc nào **trước giờ khởi hành** (giá trị mặc định = 0 phút, tức là cho phép hủy đến ngay sát giờ bay). Sau khi hủy, ghế được trả về trạng thái trống.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `UPDATE VE SET TrangThaiVe = 'Đã hủy'`:

```sql
DECLARE @huyChamNhat INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'TGHuyChamNhat');
IF GETDATE() >= DATEADD(MINUTE, -@huyChamNhat, @NgayGioBay)
    RAISERROR(N'Không thể hủy vé. Thời hạn hủy đã qua.', 16, 1);

-- Sau khi hủy thành công: trả ghế về trống
UPDATE CT_HANGVE
SET SoGheDaDat = SoGheDaDat - 1
WHERE MaChuyenBay = @MaChuyenBay AND MaHangVe = @MaHangVe;
```

- **Bảng tham chiếu:** `VE.TrangThaiVe`, `CHUYENBAY.NgayGioBay`, `CT_HANGVE.SoGheDaDat`

---

### 9. `ThoiGianChoPhepDoiVe`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianChoPhepDoiVe` |
| **Giá trị mặc định** | `24` |
| **Đơn vị** | Giờ (trước giờ khởi hành chuyến cũ) |
| **Quy định nguồn** | QĐ6.2 |

**Ý nghĩa cho người dùng:**  
Khách hàng chỉ được đổi sang chuyến bay khác khi còn ít nhất 24 giờ trước giờ khởi hành của chuyến hiện tại. Chuyến mới phải cùng tuyến đường (cùng sân bay đi và đến) và còn ghế trống.

**Logic nghiệp vụ cho Agent/Developer:**  
Ba điều kiện phải đồng thời thỏa mãn khi xử lý đổi chuyến:

```sql
DECLARE @tgDoiVe INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianChoPhepDoiVe');

-- Điều kiện 1: Còn đủ thời gian để đổi
IF GETDATE() >= DATEADD(HOUR, -@tgDoiVe, @NgayGioBay_Cu)
    RAISERROR(N'Không thể đổi vé. Phải đổi trước %d giờ so với giờ khởi hành.', 16, 1, @tgDoiVe);

-- Điều kiện 2: Chuyến mới cùng tuyến
IF NOT EXISTS (
    SELECT 1 FROM CHUYENBAY
    WHERE MaChuyenBay = @MaChuyenBay_Moi
      AND SanBayDi  = @SanBayDi_Cu
      AND SanBayDen = @SanBayDen_Cu
)
    RAISERROR(N'Chuyến bay mới phải cùng tuyến đường.', 16, 1);

-- Điều kiện 3: Chuyến mới còn ghế
IF NOT EXISTS (
    SELECT 1 FROM CT_HANGVE
    WHERE MaChuyenBay = @MaChuyenBay_Moi
      AND MaHangVe    = @MaHangVe
      AND (SoLuong - SoGheDaDat) > 0
)
    RAISERROR(N'Chuyến bay mới không còn ghế hạng yêu cầu.', 16, 1);
```

- **Bảng tham chiếu:** `VE`, `CHUYENBAY`, `CT_HANGVE`

---

### 10. `ThueVAT`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThueVAT` |
| **Giá trị hiện tại** | `10` |
| **Đơn vị** | % (phần trăm) |
| **Quy định nguồn** | QĐ7 |

**Ý nghĩa cho người dùng:**  
Tất cả hóa đơn thanh toán đều cộng thêm 10% VAT vào giá dịch vụ. Đây là thuế nhà nước, áp dụng lên toàn bộ giá trị (vé + phụ phí hành lý + phí đổi/hủy nếu có).

**Logic nghiệp vụ cho Agent/Developer:**  
Tính `GiaSauThue` khi `INSERT THANHTOAN`:

```sql
DECLARE @vat FLOAT = (SELECT CAST(GiaTri AS FLOAT) FROM THAM_SO WHERE TenThamSo = 'ThueVAT') / 100.0;
SET @GiaSauThue = @GiaGoc * (1 + @vat);
-- Ví dụ: Giá vé 1.000.000đ → GiaSauThue = 1.000.000 × 1.10 = 1.100.000đ
```

- `GiaGoc` là tổng giá dịch vụ trước thuế (giá vé + hành lý + phí phát sinh).
- **Bảng tham chiếu:** `THANHTOAN.GiaSauThue`, `VE.GiaVe`, `GOIHANHLY.TongTien`

---

### 11. `ThoiHanThanhToan`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiHanThanhToan` |
| **Giá trị hiện tại** | `2` |
| **Đơn vị** | Giờ (sau khi tạo phiếu đặt chỗ) |
| **Quy định nguồn** | QĐ7 |

**Ý nghĩa cho người dùng:**  
Sau khi đặt chỗ thành công, khách hàng có **2 giờ** để thanh toán. Hết thời hạn mà chưa thanh toán, phiếu đặt chỗ tự động bị hủy và ghế trả về trống.

**Logic nghiệp vụ cho Agent/Developer:**  

```sql
-- Gán HanThanhToan khi INSERT PHIEUDATCHO
DECLARE @thoiHan INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiHanThanhToan');
SET PHIEUDATCHO.HanThanhToan = DATEADD(HOUR, @thoiHan, PHIEUDATCHO.NgayDat);

-- Batch job (chạy mỗi 5–10 phút): hủy phiếu quá hạn chưa thanh toán
UPDATE PHIEUDATCHO
SET TrangThai = N'Đã hủy'
WHERE TrangThai = N'Đang giữ chỗ'
  AND HanThanhToan < GETDATE();
-- Sau đó: hoàn trả ghế (giảm SoGheDaDat trong CT_HANGVE)
```

- **Bảng tham chiếu:** `PHIEUDATCHO.HanThanhToan`, `PHIEUDATCHO.TrangThai`, `CT_HANGVE.SoGheDaDat`

---

### 12. `TrongLuongToiDaMotKien`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `TrongLuongToiDaMotKien` |
| **Giá trị mặc định** | `32` |
| **Đơn vị** | Kg |
| **Quy định nguồn** | QĐ8 |

**Ý nghĩa cho người dùng:**  
Mỗi kiện hành lý ký gửi không được nặng quá **32 kg** theo tiêu chuẩn an toàn lao động quốc tế. Nếu hành lý nặng hơn, nhân viên **bắt buộc** phải chia thành nhiều kiện trước khi nhận ký gửi.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT KIENHANHLY`:

```sql
DECLARE @maxKien FLOAT = (SELECT CAST(GiaTri AS FLOAT) FROM THAM_SO WHERE TenThamSo = 'TrongLuongToiDaMotKien');
IF @TrongLuong > @maxKien
    RAISERROR(N'Kiện hành lý vượt %g kg. Vui lòng tách kiện.', 16, 1, @maxKien);
```

- Giá trị này cũng được dùng để hardcode ràng buộc `CHECK (TrongLuong <= 32)` trực tiếp trong DDL bảng `KIENHANHLY`.
- **Bảng tham chiếu:** `KIENHANHLY.TrongLuong`, `GOIHANHLY`

---

### 13. `SoKienToiDa`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `SoKienToiDa` |
| **Giá trị mặc định** | `15` |
| **Đơn vị** | Kiện |
| **Quy định nguồn** | QĐ8 |

**Ý nghĩa cho người dùng:**  
Một gói hành lý tối đa chứa **15 kiện**. Đây là giới hạn vận hành để đảm bảo an toàn và quản lý hành lý hiệu quả trên mỗi chuyến bay.

**Logic nghiệp vụ cho Agent/Developer:**  
Kiểm tra khi `INSERT KIENHANHLY` (thêm kiện mới vào gói):

```sql
DECLARE @maxKien INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'SoKienToiDa');
DECLARE @soKienHienTai INT = (SELECT COUNT(*) FROM KIENHANHLY WHERE MaGoiHanhLy = @MaGoiHanhLy);
IF @soKienHienTai >= @maxKien
    RAISERROR(N'Gói hành lý đã đạt tối đa %d kiện.', 16, 1, @maxKien);
```

- **Bảng tham chiếu:** `KIENHANHLY.MaGoiHanhLy`, `GOIHANHLY`

---

### 14. `ThoiGianMuaHanhLyUuDai`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianMuaHanhLyUuDai` |
| **Giá trị hiện tại** | `3` |
| **Đơn vị** | Giờ (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ8 |

**Ý nghĩa cho người dùng:**  
Khách hàng mua thêm hành lý ký gửi **trước ít nhất 3 giờ** so với giờ khởi hành được áp dụng **giá ưu đãi** (`Mua trước`). Nếu mua sau mốc này (hoặc trực tiếp tại sân bay), áp dụng giá tại quầy (cao hơn).

**Logic nghiệp vụ cho Agent/Developer:**  
Xác định `MaBangGia` khi `INSERT GOIHANHLY`:

```sql
DECLARE @tgUuDai INT = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianMuaHanhLyUuDai');
DECLARE @loaiGia NVARCHAR(50);
IF GETDATE() < DATEADD(HOUR, -@tgUuDai, @NgayGioBay)
    SET @loaiGia = N'Mua trước 3h';   -- giá ưu đãi
ELSE
    SET @loaiGia = N'Mua tại quầy';   -- giá cao hơn

SELECT MaBangGia FROM BANGGIA_HANHLY WHERE LoaiGia = @loaiGia;
-- Dùng MaBangGia này khi INSERT GOIHANHLY
```

- **Bảng tham chiếu:** `BANGGIA_HANHLY.LoaiGia`, `GOIHANHLY.MaBangGia`, `CHUYENBAY.NgayGioBay`

---

### 15. `ThoiGianMoCheckInOnline`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianMoCheckInOnline` |
| **Giá trị hiện tại** | `24` |
| **Đơn vị** | Giờ (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ11 |

**Ý nghĩa cho người dùng:**  
Cổng check-in online **mở trước 24 giờ** so với giờ khởi hành. Trước thời điểm này, hành khách chưa thể làm thủ tục online.

**Logic nghiệp vụ cho Agent/Developer:**  
Cùng với `ThoiGianDongCheckInOnline`, xác định cửa sổ check-in hợp lệ:

```sql
DECLARE @moCI INT    = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianMoCheckInOnline');
DECLARE @dongCI INT  = (SELECT CAST(GiaTri AS INT) FROM THAM_SO WHERE TenThamSo = 'ThoiGianDongCheckInOnline');

DECLARE @thoiDiemMo   DATETIME = DATEADD(HOUR,   -@moCI,   @NgayGioBay);
DECLARE @thoiDiemDong DATETIME = DATEADD(MINUTE, -@dongCI, @NgayGioBay);

-- Cửa sổ check-in hợp lệ: [NgayGioBay - 24h,  NgayGioBay - 60min]
IF GETDATE() NOT BETWEEN @thoiDiemMo AND @thoiDiemDong
    RAISERROR(N'Ngoài cửa sổ check-in online. Vui lòng làm thủ tục tại quầy.', 16, 1);

-- Kiểm tra thêm: vé phải đã thanh toán đủ
IF NOT EXISTS (
    SELECT 1 FROM THANHTOAN WHERE MaVe = @MaVe
) OR (SELECT TrangThaiVe FROM VE WHERE MaVe = @MaVe) != N'Hợp lệ'
    RAISERROR(N'Vé chưa thanh toán đủ. Vui lòng ra quầy để làm thủ tục.', 16, 1);
```

- **Bảng tham chiếu:** `CHECKIN`, `CHUYENBAY.NgayGioBay`, `VE.TrangThaiVe`, `THANHTOAN`

---

### 16. `ThoiGianDongCheckInOnline`

| Thuộc tính | Giá trị |
|---|---|
| **Tên trong `THAM_SO`** | `ThoiGianDongCheckInOnline` |
| **Giá trị hiện tại** | `60` |
| **Đơn vị** | Phút (trước giờ khởi hành) |
| **Quy định nguồn** | QĐ11 |

**Ý nghĩa cho người dùng:**  
Cổng check-in online tự động **đóng trước 60 phút** so với giờ khởi hành. Sau mốc này, hành khách bắt buộc phải làm thủ tục tại quầy dù vé hoàn toàn hợp lệ.

**Logic nghiệp vụ cho Agent/Developer:**  
Xem logic tích hợp tại mục 15 (`ThoiGianMoCheckInOnline`). Hai tham số này luôn được đọc và kiểm tra cùng nhau trong một lần gọi.

Tóm tắt cửa sổ check-in online:
```
[NgayGioBay - 24h]  →  MỞ CHECK-IN ONLINE
        ...hành khách check-in trong giai đoạn này...
[NgayGioBay - 60p]  →  ĐÓNG CHECK-IN ONLINE → yêu cầu ra quầy
[NgayGioBay]        →  KHỞI HÀNH
```

- **Bảng tham chiếu:** `CHECKIN`, `VE.TrangThaiVe`, `THANHTOAN`, `CHUYENBAY.NgayGioBay`

---

## 📊 Script khởi tạo – Toàn bộ dữ liệu `THAM_SO`

Script bên dưới thiết lập toàn bộ tham số cho bảng `THAM_SO` từ đầu. Bao gồm **đổi tên bảng** từ `APP_CONFIG` và **xóa các biến không thuộc thiết kế** (`DIEM_TICH_LUY_PER_100K`, `GIA_VE_TOI_THIEU`, `PHI_DOI_VE`, `PHI_HANH_LY_KG_VUOT`, `PHI_HUY_VE`).

```sql
-- =====================================================
-- BƯỚC 1: Đổi tên bảng APP_CONFIG → THAM_SO
-- =====================================================
EXEC sp_rename 'APP_CONFIG', 'THAM_SO';
-- Lưu ý: cập nhật tất cả tham chiếu trong stored procedures,
-- views, và application code từ APP_CONFIG → THAM_SO

-- =====================================================
-- BƯỚC 2: Xóa các key không thuộc thiết kế THAM_SO
-- (những key này không có trong bảng THAMSO thiết kế gốc)
-- =====================================================
DELETE FROM THAM_SO WHERE TenThamSo IN (
    'DIEM_TICH_LUY_PER_100K',  -- không có trong thiết kế
    'GIA_VE_TOI_THIEU',         -- không có trong thiết kế
    'PHI_DOI_VE',               -- không có trong thiết kế
    'PHI_HANH_LY_KG_VUOT',      -- không có trong thiết kế
    'PHI_HUY_VE'                -- không có trong thiết kế
);

-- =====================================================
-- BƯỚC 3: Cập nhật / Thêm mới tất cả tham số
-- (dùng MERGE để idempotent – chạy nhiều lần vẫn an toàn)
-- =====================================================
MERGE THAM_SO AS target
USING (VALUES
    -- Tên tham số                         Giá trị   Mô tả
    ('TuoiMuaVeToiThieu',        '18',    N'Tuổi tối thiểu để mua vé (năm)'),
    ('ThoiGianBayToiThieu',      '30',    N'Thời gian bay tối thiểu (phút)'),
    ('SoSanBayTrungGianToiDa',   '2',     N'Số sân bay trung gian tối đa mỗi chuyến bay'),
    ('ThoiGianDungToiThieu',     '45',    N'Thời gian dừng tối thiểu tại sân bay TG (phút)'),
    ('ThoiGianDungToiDa',        '120',   N'Thời gian dừng tối đa tại sân bay TG (phút)'),
    ('ThoiGianDongBanVe',        '45',    N'Phút trước giờ bay đóng bán vé tại quầy'),
    ('TGDatVeChamNhat',          '120',   N'Phút trước giờ bay để đặt vé qua app/web'),
    ('TGHuyChamNhat',            '0',     N'Phút trước giờ bay được phép hủy vé (0 = đến tận giờ bay)'),
    ('ThoiGianChoPhepDoiVe',     '24',    N'Giờ trước giờ bay được phép đổi chuyến'),
    ('ThueVAT',                  '10',    N'% thuế VAT áp dụng lên tổng thanh toán'),
    ('ThoiHanThanhToan',         '2',     N'Giờ thời hạn thanh toán sau khi đặt chỗ'),
    ('TrongLuongToiDaMotKien',   '32',    N'Trọng lượng tối đa một kiện hành lý (kg)'),
    ('SoKienToiDa',              '15',    N'Số kiện hành lý tối đa trong một gói'),
    ('ThoiGianMuaHanhLyUuDai',   '3',     N'Giờ trước giờ bay để được giá mua hành lý ưu đãi'),
    ('ThoiGianMoCheckInOnline',  '24',    N'Giờ trước giờ bay mở check-in online'),
    ('ThoiGianDongCheckInOnline','60',    N'Phút trước giờ bay đóng check-in online'),
    -- Giữ lại các key hệ thống không liên quan nghiệp vụ vé
    ('ACCESS_TOKEN_MINUTES',     '30',    N'Số phút access token JWT còn hiệu lực'),
    ('REFRESH_TOKEN_EXPIRY_DAYS','7',     N'Số ngày refresh token còn hiệu lực')
) AS source (TenThamSo, GiaTri, MoTa)
ON target.TenThamSo = source.TenThamSo
WHEN MATCHED THEN
    UPDATE SET GiaTri = source.GiaTri, MoTa = source.MoTa, CapNhatLuc = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (TenThamSo, GiaTri, MoTa, CapNhatLuc)
    VALUES (source.TenThamSo, source.GiaTri, source.MoTa, GETDATE());
```

---

## 🧪 Test cases – Kiểm thử logic tham số

### Test 1: Ràng buộc `ThoiGianDongBanVe` < `TGDatVeChamNhat`

```sql
-- PASS: 45 phút < 120 phút → hợp lệ
-- FAIL: Nếu admin đặt ThoiGianDongBanVe = 150 phút → phải báo lỗi
UPDATE THAM_SO SET GiaTri = '150' WHERE TenThamSo = 'ThoiGianDongBanVe';
-- Trigger/SP kiểm tra phải RAISERROR ở đây
```

### Test 2: Đặt vé qua app đúng hạn

```sql
-- Chuyến bay NgayGioBay = '2026-06-01 10:00'
-- Thời điểm đặt = '2026-06-01 07:30' → còn 150 phút > 120 phút → PASS
-- Thời điểm đặt = '2026-06-01 08:30' → còn 90 phút < 120 phút  → FAIL
```

### Test 3: Bán vé tại quầy

```sql
-- Thời điểm bán = '2026-06-01 09:10' → còn 50 phút > 45 phút → PASS
-- Thời điểm bán = '2026-06-01 09:20' → còn 40 phút < 45 phút → FAIL
```

### Test 4: Khoảng dừng sân bay trung gian

```sql
-- ThoiGianDung = 44  → FAIL (< 45 phút)
-- ThoiGianDung = 90  → PASS (trong [45, 120])
-- ThoiGianDung = 121 → FAIL (> 120 phút)
```

### Test 5: Cửa sổ check-in online

```sql
-- NgayGioBay = '2026-06-01 10:00'
-- Check-in lúc '2026-05-31 10:30' → còn 23.5h < 24h → FAIL (chưa mở)
-- Check-in lúc '2026-05-31 10:00' → đúng 24h trước  → PASS (mới mở)
-- Check-in lúc '2026-06-01 09:01' → còn 59 phút     → PASS
-- Check-in lúc '2026-06-01 09:00' → đúng 60 phút    → FAIL (đã đóng)
```

---

## 🗺️ Sơ đồ quan hệ: Tham số → Bảng dữ liệu

```
THAM_SO
│
├── TuoiMuaVeToiThieu          → KHACHHANG.NgaySinh
├── ThoiGianBayToiThieu        → CHUYENBAY.ThoiGianBay
├── SoSanBayTrungGianToiDa     → TRUNGGIAN (COUNT per MaChuyenBay)
├── ThoiGianDungToiThieu ──┐
├── ThoiGianDungToiDa   ──┘→ TRUNGGIAN.ThoiGianDung  [45 ≤ x ≤ 120]
│
├── ThoiGianDongBanVe ─── (<) ──┐
├── TGDatVeChamNhat   ──────────┘ ràng buộc bắt buộc
│         ├── ThoiGianDongBanVe → VE (kênh quầy) ← CHUYENBAY.NgayGioBay
│         └── TGDatVeChamNhat   → PHIEUDATCHO (kênh app) ← CHUYENBAY.NgayGioBay
│
├── TGHuyChamNhat              → VE.TrangThaiVe + CT_HANGVE.SoGheDaDat
├── ThoiGianChoPhepDoiVe       → VE + CHUYENBAY (cùng tuyến) + CT_HANGVE (còn ghế)
├── ThueVAT                    → THANHTOAN.GiaSauThue
├── ThoiHanThanhToan           → PHIEUDATCHO.HanThanhToan + CT_HANGVE.SoGheDaDat
├── TrongLuongToiDaMotKien     → KIENHANHLY.TrongLuong
├── SoKienToiDa                → KIENHANHLY (COUNT per MaGoiHanhLy)
├── ThoiGianMuaHanhLyUuDai     → BANGGIA_HANHLY.LoaiGia ← GOIHANHLY.MaBangGia
├── ThoiGianMoCheckInOnline ──┐
└── ThoiGianDongCheckInOnline ┘→ CHECKIN + VE.TrangThaiVe + THANHTOAN
```

---

*Tài liệu được tạo và cập nhật dựa trên thiết kế cơ sở dữ liệu hệ thống quản lý vé máy bay và các quy định QĐ1–QĐ11.*  
*Phiên bản: 2.0 – Chuẩn hóa bảng `THAM_SO`, bỏ các biến không thuộc thiết kế.*
