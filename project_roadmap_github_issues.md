# Project Technical Roadmap & GitHub Issues
# Phần Mềm Quản Lý Bán Vé Máy Bay

---

## 1. Tổng quan hệ thống

**Tên hệ thống:** Phần Mềm Quản Lý Bán Vé Máy Bay  
**Môn học:** SE104.Q22 – Nhập môn Công nghệ phần mềm  
**Backend framework:** Spring Boot  
**Database:** SQL Server (chạy trên Docker)  
**Giao diện:** Web Application  

### Mục tiêu hệ thống

Xây dựng một phần mềm quản lý toàn bộ nghiệp vụ bán vé máy bay dành cho các phòng vé và đại lý vé máy bay, bao gồm: quản lý lịch chuyến bay, đặt và bán vé, quản lý hành lý ký gửi, check-in online, phân quyền người dùng và lập báo cáo doanh thu.

### Vai trò người dùng

| Vai trò | Mô tả | Quyền chính |
|---|---|---|
| **Admin (Quản trị viên)** | Quản lý toàn bộ hệ thống | Tất cả quyền: phân quyền, bán vé, tạo tài khoản, thay đổi quy định, báo cáo |
| **Staff (Nhân viên)** | Nhân viên quầy vé | Bán vé, tra cứu chuyến bay, thay đổi quy định, lập báo cáo |
| **Agent (Đại lý)** | Đại lý bán vé bên ngoài | Bán vé, tra cứu chuyến bay |
| **User (Khách hàng)** | Hành khách | Đặt vé online, tra cứu chuyến bay, tự tạo tài khoản |

### Các module chính

1. **Quản lý tài khoản & phân quyền** – Đăng nhập, phân vai trò, RBAC
2. **Quản lý thông tin khách hàng** – CRUD khách hàng, hạng thành viên, điểm tích lũy
3. **Quản lý chuyến bay** – Nhận lịch, quản lý tuyến bay, sân bay
4. **Bán vé & đặt vé** – Bán trực tiếp, đặt giữ chỗ, hủy, đổi chuyến, nâng hạng
5. **Quản lý thanh toán** – Hóa đơn, trạng thái thanh toán, VAT
6. **Quản lý hành lý ký gửi** – Đăng ký gói hành lý, tính phí, quản lý kiện hàng
7. **Check-in online** – Xuất Boarding Pass, quản lý thời gian check-in
8. **Báo cáo & thống kê** – Doanh thu theo tháng/năm, export Excel/PDF
9. **Quản lý quy định** – Thay đổi tham số nghiệp vụ linh hoạt (Admin only)

### Luồng xử lý tổng quát

```
Giao diện (GUI)
    ↓ HTTP Request (JSON)
Spring Boot Backend
    ├── Authorization Manager (JWT + RBAC)
    ├── Validation Engine (Business Rules)
    └── Business Managers (Nghiệp vụ)
            ↓ JDBC / JPA
        DAO Layer
            ↓ SQL / Stored Procedure
        SQL Server (Docker)
```

### Yêu cầu phi chức năng

| Tiêu chí | Yêu cầu |
|---|---|
| **Bảo mật** | JWT Auth, RBAC, hash mật khẩu BCrypt, không dùng `sa`, least privilege, audit log |
| **Hiệu năng** | Tra cứu < 1s, bán vé < 3s, báo cáo < 5s; có index phù hợp |
| **Dữ liệu nhất quán** | Không xóa chuyến bay có vé, không bán vượt số ghế, ràng buộc FK |
| **Dễ bảo trì** | 3-layer architecture, đặt tên chuẩn, có Swagger docs |
| **Dễ mở rộng** | Module độc lập, tham số nghiệp vụ lưu trong DB (THAMSO) |
| **Docker** | SQL Server + Backend đều chạy được bằng `docker-compose up` |
| **Demo/Test** | Có seed data đầy đủ cho tất cả vai trò và nghiệp vụ |

---

## 2. Tag GitHub đề xuất

| Tag | Màu gợi ý | Mục đích sử dụng | Ví dụ issue |
|---|---|---|---|
| `figma` | `#7c3aed` (tím) | Tất cả issue thiết kế UI/UX trên Figma | Thiết kế màn hình bán vé |
| `database` | `#0369a1` (xanh đậm) | Schema, SP, trigger, view, function, index | Thiết kế bảng VE, CHUYENBAY |
| `backend` | `#15803d` (xanh lá) | API, business logic, Spring Boot | Xây dựng API bán vé |
| `security` | `#dc2626` (đỏ) | Auth, RBAC, phân quyền DB, bảo mật | Setup JWT, tạo DB user cho app |
| `docker` | `#0284c7` (xanh nhạt) | Dockerfile, docker-compose, volume, env | Setup SQL Server container |
| `seed-data` | `#d97706` (cam) | Dữ liệu demo, script khởi tạo dữ liệu | Tạo tài khoản demo các vai trò |
| `api` | `#059669` (xanh mint) | Endpoint REST API, request/response format | API tra cứu chuyến bay |
| `priority-high` | `#ef4444` (đỏ sáng) | Issue cần làm trước, blocking khác | Setup Docker, Auth, Schema |

---

## 3. Figma Design Issues

---

### Issue F-01: Thiết kế Design System & Style Guide

**Tag:** `figma`, `priority-high`

#### Mục tiêu
Xây dựng một Design System thống nhất làm nền tảng cho toàn bộ giao diện. Mọi màn hình khác phải tuân theo hệ thống này.

#### Mô tả chi tiết
Tạo một Figma file riêng chứa Design System, bao gồm màu sắc, typography, spacing, component cơ bản. Đây là bước đầu tiên bắt buộc trước khi thiết kế bất kỳ màn hình nào.

#### Style thiết kế

**Phong cách tổng thể:** Clean Enterprise UI – hiện đại, chuyên nghiệp, dễ đọc, phù hợp môi trường văn phòng.

**Màu sắc:**
```
Primary:   #1D4ED8  (Blue 700)
Primary Light: #3B82F6 (Blue 500)
Primary Dark:  #1E3A8A (Blue 900)
Secondary: #FFFFFF  (White)
Background: #F8FAFC (Slate 50)
Surface:   #FFFFFF  (Card background)
Border:    #E2E8F0  (Slate 200)
Text Primary:   #0F172A (Slate 900)
Text Secondary: #64748B (Slate 500)
Text Muted:     #94A3B8 (Slate 400)
Success: #16A34A (Green 600)
Warning: #D97706 (Amber 600)
Error:   #DC2626 (Red 600)
Info:    #0284C7 (Sky 600)
```

**Typography:**
- Font: `Inter` (Google Fonts) – tất cả các loại text
- Heading 1: 24px / Bold / #0F172A
- Heading 2: 20px / SemiBold / #0F172A
- Heading 3: 16px / SemiBold / #0F172A
- Body Large: 15px / Regular / #0F172A
- Body: 14px / Regular / #0F172A
- Small: 12px / Regular / #64748B
- Label: 12px / Medium / #64748B (uppercase tracking-wide)

**Spacing system:** Base 4px → 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

**Border radius:**
- Button, Input: 8px
- Card: 12px
- Modal: 16px
- Badge/Tag: 4px
- Avatar: 50%

**Shadow:**
- Card shadow: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Modal shadow: `0 10px 25px rgba(0,0,0,0.15)`
- Dropdown shadow: `0 4px 6px rgba(0,0,0,0.07)`

#### Thành phần UI cần thiết kế trong Design System

**Buttons:**
- Primary Button: bg #1D4ED8, text white, hover #1E3A8A
- Secondary Button: border #1D4ED8, text #1D4ED8, hover bg #EFF6FF
- Danger Button: bg #DC2626, text white
- Ghost Button: no border, text #64748B, hover bg #F1F5F9
- Icon Button: square, 36×36px
- Kích thước: SM (32px), MD (40px), LG (48px)
- Trạng thái: default, hover, active, disabled, loading (spinner)

**Form Inputs:**
- Text Input: height 40px, border #E2E8F0, focus border #1D4ED8, focus ring xanh nhạt
- Select Dropdown
- Textarea
- Date/DateTime Picker
- Number Input
- Search Input (có icon kính lúp trái)
- Label trên input, font 14px Medium
- Error message màu đỏ, icon warning, dưới input
- Required indicator: dấu `*` màu đỏ

**Table:**
- Header: bg #F8FAFC, text #64748B, 12px uppercase, font Medium
- Row: height 52px, border-bottom #F1F5F9
- Row hover: bg #F8FAFC
- Striped rows (tùy chọn)
- Cột cuối: actions (icon buttons)
- Empty state khi không có dữ liệu
- Phân trang (pagination) dưới bảng

**Cards:**
- Stat Card: icon + số lớn + label + trend (arrow + %)
- Content Card: header + body + optional footer
- List Card: title + subtitle + right action

**Badges/Tags:**
- Status Badge: rounded-full, 5 màu (success, warning, error, info, neutral)
- Role Badge: màu theo vai trò (Admin=đỏ, Staff=xanh, Agent=vàng, User=xám)

**Modals:**
- Width: 480px (SM), 640px (MD), 800px (LG)
- Header: title + close button (X)
- Body: scrollable nếu dài
- Footer: Cancel + Confirm buttons
- Overlay: bg rgba(0,0,0,0.4) backdrop-blur-sm

**Notifications/Toasts:**
- Vị trí: top-right
- Loại: success (xanh lá), error (đỏ), warning (vàng), info (xanh)
- Auto-dismiss sau 4s, có close button

**Empty States:**
- Illustration nhỏ (SVG icon 80px)
- Tiêu đề "Không có dữ liệu"
- Mô tả ngắn
- Optional CTA button

**Loading States:**
- Skeleton loader cho table rows
- Spinner cho button
- Overlay spinner cho toàn trang khi cần

#### Tiêu chí hoàn thành
- [ ] Có Figma file Design System riêng
- [ ] Có đủ màu sắc trong Color Styles
- [ ] Có đủ Typography Styles
- [ ] Có component Button (5 variant × 3 size × 5 state)
- [ ] Có component Input (6 loại × trạng thái)
- [ ] Có component Table (header, row, empty, pagination)
- [ ] Có component Card (3 loại)
- [ ] Có component Modal (3 size)
- [ ] Có component Badge/Tag
- [ ] Có Toast notification
- [ ] Có Loading/Empty state
- [ ] Tất cả component có Auto Layout

---

### Issue F-02: Thiết kế Layout tổng thể & Navigation

**Tag:** `figma`, `priority-high`

#### Mục tiêu
Thiết kế layout khung chính của ứng dụng bao gồm sidebar, header, breadcrumb, user menu. Layout này áp dụng cho tất cả màn hình sau khi đăng nhập.

#### Mô tả chi tiết

**Layout Desktop (≥ 1280px):**
```
┌─────────────────────────────────────────────────────┐
│  HEADER (64px)                      [User] [Bell]   │
├──────────┬──────────────────────────────────────────┤
│          │  Breadcrumb                               │
│ SIDEBAR  │  ─────────────────────────────────────   │
│ (240px)  │                                          │
│          │        MAIN CONTENT AREA                 │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Sidebar (240px fixed):**
- Logo hệ thống ở top (64px height, căn giữa)
- Navigation items (icon 20px + label 14px)
- Active item: bg #EFF6FF, text #1D4ED8, border-left 3px solid #1D4ED8
- Hover: bg #F8FAFC
- Nhóm menu có divider và section label màu #94A3B8, 11px uppercase
- Collapsible groups (có chevron)
- User info ở bottom (avatar + tên + role badge + logout)

**Menu items theo vai trò:**

Admin:
- Dashboard
- Chuyến bay (Danh sách, Thêm mới)
- Vé máy bay (Bán vé, Đặt vé, Danh sách vé)
- Khách hàng
- Hành lý ký gửi
- Thanh toán
- Check-in
- Báo cáo
- Quản lý hệ thống (Tài khoản, Quy định)

Staff:
- Dashboard
- Chuyến bay
- Vé máy bay
- Khách hàng
- Hành lý ký gửi
- Thanh toán
- Check-in
- Báo cáo
- Quy định

Agent:
- Bán vé
- Tra cứu chuyến bay
- Danh sách vé

User (Portal riêng):
- Tìm chuyến bay
- Đặt vé của tôi
- Check-in
- Thông tin tài khoản

**Header (64px):**
- Left: Hamburger (collapse sidebar) + Breadcrumb
- Right: Notification bell (badge số) + Avatar + Dropdown (Profile, Đổi mật khẩu, Đăng xuất)

**Breadcrumb:**
- Ví dụ: `Trang chủ / Vé máy bay / Bán vé`
- Link màu #64748B, active item màu #0F172A
- Separator: `/`

#### Responsive behavior
- **Desktop ≥ 1280px:** Sidebar full (240px) + content
- **Tablet 768–1279px:** Sidebar thu gọn (64px, chỉ icon) hoặc overlay sidebar
- **Mobile < 768px:** Sidebar ẩn, mở bằng hamburger, overlay toàn màn

#### Tiêu chí hoàn thành
- [ ] Frame Desktop layout (1440×900)
- [ ] Frame Tablet layout (1024×768)
- [ ] Frame Mobile layout (375×812)
- [ ] Sidebar mở rộng (240px)
- [ ] Sidebar thu gọn (64px, icon only)
- [ ] Sidebar mobile overlay
- [ ] Header với user dropdown
- [ ] Breadcrumb component
- [ ] Menu items theo từng vai trò (4 variant)
- [ ] Active/hover state cho nav items

---

### Issue F-03: Thiết kế màn hình Đăng nhập

**Tag:** `figma`

#### Mục tiêu
Thiết kế trang đăng nhập cho hệ thống nội bộ (Admin/Staff/Agent) và portal khách hàng.

#### Flow người dùng
1. Truy cập hệ thống → Redirect đến trang đăng nhập
2. Nhập tên đăng nhập + mật khẩu
3. Click "Đăng nhập"
4. Loading state (spinner trên button)
5. Thành công → Redirect dashboard theo vai trò
6. Thất bại → Hiển thị lỗi inline

#### Thành phần giao diện

**Layout:**
- Split screen: Left 50% có background gradient xanh dương + logo + tagline
- Right 50%: form đăng nhập trên nền trắng, căn giữa dọc

**Form đăng nhập (right panel):**
- Logo nhỏ + tên hệ thống (top)
- Tiêu đề "Đăng nhập" (Heading 1)
- Subtitle mô tả ngắn
- Input: Tên đăng nhập (icon user trái)
- Input: Mật khẩu (icon lock trái, icon show/hide phải)
- Checkbox "Ghi nhớ đăng nhập"
- Link "Quên mật khẩu?"
- Button Primary full-width "Đăng nhập"
- Divider
- Link đăng ký (dành cho khách hàng)

**Left panel:**
- Background: gradient #1D4ED8 → #1E3A8A
- Logo trắng 48px
- Tagline "Hệ thống Quản lý Bán Vé Máy Bay"
- Mô tả ngắn (2–3 dòng, text trắng 60% opacity)
- Illustration: icon máy bay hoặc hình đơn giản

#### Trạng thái cần thiết kế
- Default (form trống)
- Input focus (border xanh)
- Input filled
- Loading (button disabled + spinner)
- Error: "Tên đăng nhập hoặc mật khẩu không đúng" (banner đỏ trên form)
- Validation error từng field: input border đỏ + message đỏ dưới

#### Responsive
- Desktop: split screen 50/50
- Tablet: form chiếm 100%, background ẩn
- Mobile: form full screen, logo nhỏ ở top

#### Tiêu chí hoàn thành
- [ ] Frame Desktop đăng nhập (1440×900)
- [ ] Frame Mobile đăng nhập (375×812)
- [ ] State: default, loading, error, field validation
- [ ] Màn hình đăng ký cho khách hàng (User)
- [ ] Màn hình quên mật khẩu (optional)

---

### Issue F-04: Thiết kế Dashboard tổng quan

**Tag:** `figma`, `priority-high`

#### Mục tiêu
Thiết kế trang dashboard hiển thị số liệu tổng quan về doanh thu, vé bán, chuyến bay và hoạt động gần đây. Dashboard khác nhau theo vai trò.

#### Mô tả chi tiết

**Dashboard Admin/Staff:**

**Row 1 – Stat Cards (4 cards):**
- Tổng doanh thu hôm nay: số tiền lớn + icon tiền + trend % so hôm qua
- Số vé bán hôm nay: số lượng + icon vé + trend
- Số chuyến bay hôm nay: số + icon máy bay + trạng thái
- Số khách hàng mới tháng này: số + icon người + trend

**Row 2 – Charts:**
- Left (60%): Line chart doanh thu 30 ngày gần nhất (trục X: ngày, trục Y: triệu đồng)
- Right (40%): Donut chart phân bổ hạng vé (Hạng 1 vs Hạng 2)

**Row 3 – Tables:**
- Left (55%): Bảng "Chuyến bay hôm nay" (Mã CB, Tuyến, Giờ bay, Số ghế còn, Trạng thái)
- Right (45%): Bảng "Vé bán gần đây" (Mã vé, Khách hàng, Chuyến, Giá, Thời gian)

**Dashboard Agent:**
- Chỉ hiển thị: Vé bán hôm nay, Doanh thu hôm nay, Chuyến bay sắp khởi hành, Quick access bán vé

**Dashboard User (portal):**
- Phiếu đặt vé của tôi (upcoming flights)
- Lịch sử đặt vé
- Điểm tích lũy + hạng thành viên
- Quick search chuyến bay

#### Thành phần giao diện
- Stat Card: icon + label + số chính (24px bold) + trend badge
- Chart area với legend
- Table với phân trang
- Quick action buttons (bán vé, thêm chuyến bay...)
- Date range filter ở top-right
- Last updated timestamp

#### Trạng thái
- Loading: skeleton cho tất cả cards và charts
- Empty: khi không có dữ liệu ngày hôm nay
- Error: banner lỗi khi API fail

#### Tiêu chí hoàn thành
- [ ] Dashboard Admin/Staff (desktop + mobile)
- [ ] Dashboard Agent
- [ ] Dashboard User/Portal
- [ ] Stat cards (4 variant)
- [ ] Line chart mockup
- [ ] Donut chart mockup
- [ ] Bảng danh sách nhỏ
- [ ] Skeleton loading state
- [ ] Responsive mobile

---

### Issue F-05: Thiết kế module Quản lý Chuyến bay

**Tag:** `figma`

#### Mục tiêu
Thiết kế đầy đủ các màn hình cho module quản lý chuyến bay.

#### Các màn hình cần thiết kế

**Màn hình 1 – Danh sách chuyến bay:**
- Filter bar (ngang): Sân bay đi, Sân bay đến, Ngày bay, Trạng thái, [Tìm kiếm]
- Nút "Thêm chuyến bay" (primary, top-right)
- Table columns: Mã CB | Sân bay đi → Đến | Ngày giờ | Thời gian bay | Ghế H1/H2 | Trạng thái | Hành động
- Badge trạng thái: Hoạt động (xanh), Đã hủy (đỏ), Hoàn thành (xám)
- Hành động: icon Xem, Sửa, Hủy (tooltip on hover)
- Phân trang bottom

**Màn hình 2 – Chi tiết chuyến bay:**
- Breadcrumb: Chuyến bay / [Mã CB]
- Header: Mã CB lớn + Badge trạng thái + nút Sửa + nút Hủy
- Card thông tin cơ bản: 2 cột (Sân bay đi/đến, Ngày giờ, Thời gian, Giá cơ bản)
- Card sân bay trung gian (nếu có): timeline dạng step
- Card ghế: H1 (tổng/đã bán/còn) + H2 (tổng/đã bán/còn) dạng progress bar
- Tab dưới: Danh sách vé đã bán | Lịch sử thay đổi

**Màn hình 3 – Form Thêm/Sửa chuyến bay:**
- Breadcrumb + tiêu đề
- Section "Thông tin tuyến bay": Sân bay đi (dropdown), Sân bay đến (dropdown) – validate khác nhau
- Section "Thời gian": Ngày giờ bay (datetime picker), Thời gian bay (số phút)
- Section "Sân bay trung gian": Toggle bật/tắt, nếu bật hiện thêm tối đa 2 dropdown sân bay + thời gian dừng
- Section "Hạng ghế": Số ghế H1, Số ghế H2, Giá cơ bản
- Footer: nút Hủy (ghost) + Lưu (primary)

#### Trạng thái
- Form validation: required fields highlight đỏ
- Sân bay đi = Sân bay đến: error inline
- Confirm dialog khi hủy chuyến bay đã có vé

#### Tiêu chí hoàn thành
- [ ] Màn hình danh sách (+ filter, + table, + pagination)
- [ ] Màn hình chi tiết
- [ ] Form thêm mới
- [ ] Form chỉnh sửa (pre-filled)
- [ ] Modal confirm hủy chuyến
- [ ] Empty state khi chưa có chuyến bay

---

### Issue F-06: Thiết kế module Bán vé & Đặt vé

**Tag:** `figma`, `priority-high`

#### Mục tiêu
Thiết kế luồng bán vé tại quầy (Staff/Admin/Agent) và luồng đặt vé online (User).

#### Màn hình 1 – Form Bán vé (Staff/Admin/Agent)

**Layout wizard 3 bước:**

Bước 1 – Chọn chuyến bay:
- Search bar: Sân bay đi, Sân bay đến, Ngày bay
- Kết quả dạng card list: Mã CB, Giờ bay, Tuyến, Giá H1/H2, Ghế còn, nút "Chọn"
- Highlight card đang chọn (border xanh)

Bước 2 – Thông tin hành khách:
- Hành khách: search theo CCCD/tên (nếu đã có trong hệ thống) hoặc nhập mới
- Auto-fill nếu tìm thấy khách hàng
- Chọn Hạng vé: H1 / H2 (radio card với giá hiển thị)
- Tóm tắt giá: Giá vé + Phụ phí + Tổng

Bước 3 – Xác nhận & Thanh toán:
- Tóm tắt đơn hàng: chuyến bay, khách hàng, hạng vé, giá
- Phương thức thanh toán: Tiền mặt / Chuyển khoản
- Nút "Xác nhận bán vé"

**Step indicator:** số bước + màu active/done/inactive

#### Màn hình 2 – Đặt vé online (User Portal)

Tương tự flow bán vé nhưng không có bước thanh toán ngay.
- Bước 1: Tìm chuyến bay
- Bước 2: Chọn hạng, nhập thông tin
- Bước 3: Xác nhận đặt giữ chỗ → Nhận email/mã đặt chỗ

#### Màn hình 3 – Danh sách vé

- Filter: Mã vé, Khách hàng, Chuyến bay, Trạng thái, Ngày
- Table: Mã vé | Khách hàng | Chuyến bay | Hạng | Giá | Trạng thái | Ngày bán | Hành động
- Badge trạng thái: Hợp lệ (xanh), Đã hủy (đỏ), Đã đổi (vàng)
- Hành động: Xem chi tiết, Đổi vé, Hủy vé, Nâng hạng

#### Màn hình 4 – Cập nhật vé (modal hoặc trang riêng)

Tabs: Nâng hạng ghế | Đổi chuyến bay | Hủy vé
- Mỗi tab có form riêng + phí tương ứng + xác nhận

#### Tiêu chí hoàn thành
- [ ] Wizard bán vé 3 bước (Step 1, 2, 3)
- [ ] Form đặt vé online (User)
- [ ] Danh sách vé với filter
- [ ] Chi tiết vé
- [ ] Modal Nâng hạng
- [ ] Modal Đổi chuyến
- [ ] Modal Hủy vé (với confirm + hiển thị phí hoàn)
- [ ] Success screen sau bán vé (in vé)

---

### Issue F-07: Thiết kế module Hành lý & Check-in

**Tag:** `figma`

#### Mục tiêu
Thiết kế màn hình đăng ký hành lý ký gửi và check-in online.

#### Màn hình 1 – Đăng ký hành lý ký gửi

- Input Mã vé (search)
- Hiển thị thông tin vé + hành khách
- Bảng giá hành lý (Mua trước / Mua tại quầy) – dạng card 2 cột, highlight recommended
- Form thêm kiện: Trọng lượng (kg) + nút Thêm kiện
- Danh sách kiện đã đăng ký: mã kiện, trọng lượng, xóa
- Cảnh báo nếu kiện > 32kg (highlight đỏ)
- Tổng tiền + nút Xác nhận

#### Màn hình 2 – Check-in online

- Input Mã vé
- Thông tin chuyến bay: từ/đến, giờ cất cánh, còn bao lâu (countdown nếu muốn)
- Thông tin ghế được xếp
- Nút "Xác nhận Check-in"
- Boarding Pass screen: layout ngang (landscape), QR code lớn, thông tin chuyến bay + ghế + cổng

**Trạng thái check-in:**
- Chưa đến giờ mở check-in → Thông báo với countdown
- Đã quá giờ đóng check-in → Thông báo lỗi "Vui lòng làm thủ tục tại quầy"
- Chưa thanh toán → Thông báo lỗi + link đến thanh toán

#### Tiêu chí hoàn thành
- [ ] Form đăng ký hành lý
- [ ] Bảng giá hành lý
- [ ] Form check-in online
- [ ] Boarding Pass (landscape)
- [ ] Các error state check-in
- [ ] Mobile responsive (check-in thường dùng trên điện thoại)

---

### Issue F-08: Thiết kế module Thanh toán & Báo cáo

**Tag:** `figma`

#### Thanh toán

**Màn hình danh sách hóa đơn:**
- Filter: Mã hóa đơn, Khách hàng, Trạng thái, Ngày
- Table: Mã HD | Khách hàng | Mã vé/đặt | Số tiền | Hình thức | Ngày lập | Trạng thái
- Badge: Đã thanh toán (xanh), Chờ thanh toán (vàng), Quá hạn (đỏ)

**Modal chi tiết hóa đơn:**
- Thông tin đầy đủ: khách hàng, dịch vụ, giá gốc, VAT, tổng
- Lịch sử thanh toán
- Nút in hóa đơn

#### Báo cáo

**Màn hình báo cáo doanh thu theo tháng:**
- Filter: Chọn tháng + năm
- Summary cards: Tổng doanh thu, Số vé, Doanh thu vé, Doanh thu hành lý
- Bar chart: doanh thu từng chuyến bay trong tháng
- Table chi tiết từng chuyến
- Nút Export Excel / Export PDF

**Màn hình báo cáo theo năm:**
- Select năm
- Line chart doanh thu 12 tháng
- Table tổng hợp từng tháng: Số chuyến, Số vé, Doanh thu, % trên tổng
- Nút Export

#### Tiêu chí hoàn thành
- [ ] Danh sách hóa đơn + filter
- [ ] Modal chi tiết hóa đơn
- [ ] Màn hình báo cáo tháng
- [ ] Màn hình báo cáo năm
- [ ] Chart mockup (bar + line)
- [ ] Export button

---

### Issue F-09: Thiết kế module Quản lý người dùng & Quy định

**Tag:** `figma`

#### Quản lý tài khoản (Admin only)

**Danh sách tài khoản:**
- Table: Tên | Email | Vai trò | Trạng thái | Ngày tạo | Hành động
- Hành động: Sửa, Khóa/Mở, Đặt lại MK
- Badge vai trò màu sắc theo vai trò
- Filter: Vai trò, Trạng thái, Tìm kiếm tên/email

**Form tạo/sửa tài khoản:**
- Họ tên, Email, Username, Mật khẩu (chỉ khi tạo mới)
- Dropdown chọn vai trò
- Toggle trạng thái kích hoạt

#### Quản lý Quy định (Admin/Staff)

**Màn hình Quy định:**
- Layout: danh sách các nhóm quy định dạng accordion/card
- Nhóm 1: Quy định bán vé → Thời gian đóng bán (input number + đơn vị giờ)
- Nhóm 2: Quy định đặt vé → Thời gian giữ chỗ tối đa
- Nhóm 3: Quy định cập nhật vé → Phí đổi, phí hủy, phí nâng hạng
- Nhóm 4: Quy định thanh toán → Thời hạn thanh toán
- Nhóm 5: Quy định hành lý → Số kiện tối đa, KG tối đa/kiện, phí vượt mức
- Nhóm 6: Quy định check-in → Giờ mở, giờ đóng trước giờ bay
- Nhóm 7: Quy định báo cáo → Kỳ báo cáo (dropdown)
- Nút Save riêng từng nhóm hoặc Save All

#### Tiêu chí hoàn thành
- [ ] Danh sách tài khoản + filter
- [ ] Form tạo/sửa tài khoản
- [ ] Modal confirm khóa tài khoản
- [ ] Màn hình quản lý quy định
- [ ] Responsive tablet/mobile

---

## 4. Database Issues

---

### Issue DB-01: Setup SQL Server bằng Docker

**Tag:** `database`, `docker`, `security`, `priority-high`

#### Mục tiêu
Thiết lập SQL Server chạy trên Docker, cấu hình đúng, bảo mật, dễ khởi động lại.

#### Công việc cần làm
- [ ] Tạo `docker-compose.yml` với service SQL Server
- [ ] Cấu hình volume lưu dữ liệu persistent
- [ ] Cấu hình `.env` và `.env.example`
- [ ] Thêm `.env` vào `.gitignore`
- [ ] Tạo script init database khi container khởi động lần đầu
- [ ] Viết README hướng dẫn start/stop

#### Chi tiết kỹ thuật

**docker-compose.yml:**
```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: vetmaybaay_sqlserver
    ports:
      - "${SQL_PORT:-1433}:1433"
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "${SA_PASSWORD}"
      MSSQL_PID: "Developer"
    volumes:
      - sqlserver_data:/var/opt/mssql
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "sa", "-P", "${SA_PASSWORD}", "-Q", "SELECT 1"]
      interval: 10s
      retries: 10
      start_period: 30s

volumes:
  sqlserver_data:
```

**.env.example:**
```
SA_PASSWORD=YourStrong@Password123
SQL_PORT=1433
DB_NAME=VeToMayBayDB
APP_DB_USER=vetmaybay_app
APP_DB_PASSWORD=AppUser@Strong456
```

**File cấu trúc cần tạo:**
```
database/
├── docker-compose.yml
├── .env.example
├── README.md
├── init/
│   ├── 01_create_database.sql
│   ├── 02_create_user.sql
│   └── 03_grant_permissions.sql
├── schema/
│   └── (các file tạo bảng)
└── seed/
    └── (các file seed data)
```

#### Lưu ý bảo mật
- **KHÔNG** dùng tài khoản `sa` trong ứng dụng backend
- Mật khẩu SA chỉ dùng để quản trị Docker, không commit lên git
- Tạo user riêng `vetmaybay_app` với quyền tối thiểu

#### Cách kiểm tra hoạt động
- `docker-compose up -d` → container phải `healthy`
- Connect bằng SSMS/Azure Data Studio: Server=`localhost,1433`, User=`sa`
- Chạy `SELECT @@VERSION` thành công

#### Tiêu chí hoàn thành
- [ ] `docker-compose up -d` chạy không lỗi
- [ ] SQL Server healthcheck PASS
- [ ] Kết nối được bằng SSMS với sa
- [ ] Volume persistent (data không mất khi restart container)
- [ ] `.env.example` đã có đủ biến
- [ ] `.env` không commit lên git
- [ ] README hướng dẫn đầy đủ

---

### Issue DB-02: Thiết kế Schema Database

**Tag:** `database`, `priority-high`

#### Mục tiêu
Tạo toàn bộ schema database bao gồm 14 bảng nghiệp vụ đã thiết kế trong tài liệu yêu cầu, thêm các bảng hệ thống cần thiết.

#### Công việc cần làm
- [ ] Tạo script tạo database
- [ ] Tạo script tạo tất cả bảng theo đúng thứ tự (FK dependency)
- [ ] Thiết lập đầy đủ PK, FK, INDEX, CONSTRAINT
- [ ] Bổ sung bảng hệ thống: TAIKHOAN, VAITRO, AUDIT_LOG, APP_CONFIG

#### Chi tiết kỹ thuật

**Bảng hệ thống (System Tables):**

```sql
-- VAITRO: Admin, Staff, Agent, User
CREATE TABLE VAITRO (
    MaVaiTro    INT PRIMARY KEY IDENTITY(1,1),
    TenVaiTro   NVARCHAR(50) NOT NULL UNIQUE,
    MoTa        NVARCHAR(200)
)

-- TAIKHOAN
CREATE TABLE TAIKHOAN (
    MaTaiKhoan  INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhauHash VARCHAR(255) NOT NULL,     -- BCrypt
    MaVaiTro    INT NOT NULL REFERENCES VAITRO(MaVaiTro),
    MaKhachHang INT REFERENCES KHACHHANG(MaKhachHang), -- NULL nếu không phải User
    Email       VARCHAR(100) UNIQUE,
    TrangThai   TINYINT DEFAULT 1,         -- 1=Active, 0=Locked
    CreatedAt   DATETIME DEFAULT GETDATE(),
    UpdatedAt   DATETIME DEFAULT GETDATE(),
    LastLogin   DATETIME
)

-- REFRESH_TOKEN
CREATE TABLE REFRESH_TOKEN (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    MaTaiKhoan  INT NOT NULL REFERENCES TAIKHOAN(MaTaiKhoan),
    Token       VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt   DATETIME NOT NULL,
    IsRevoked   BIT DEFAULT 0,
    CreatedAt   DATETIME DEFAULT GETDATE()
)

-- AUDIT_LOG
CREATE TABLE AUDIT_LOG (
    Id          BIGINT PRIMARY KEY IDENTITY(1,1),
    MaTaiKhoan  INT REFERENCES TAIKHOAN(MaTaiKhoan),
    TenHanhDong VARCHAR(100) NOT NULL, -- CREATE_VE, UPDATE_VE, DELETE_VE, LOGIN, ...
    TenBang     VARCHAR(100),           -- Bảng bị ảnh hưởng
    MaBanGhi    VARCHAR(50),            -- ID bản ghi bị ảnh hưởng
    DuLieuCu    NVARCHAR(MAX),          -- JSON dữ liệu cũ
    DuLieuMoi   NVARCHAR(MAX),          -- JSON dữ liệu mới
    IpAddress   VARCHAR(50),
    UserAgent   VARCHAR(500),
    ThoiGian    DATETIME DEFAULT GETDATE()
)

-- APP_CONFIG (lưu THAMSO nghiệp vụ)
CREATE TABLE APP_CONFIG (
    ConfigKey   VARCHAR(100) PRIMARY KEY,
    ConfigValue NVARCHAR(500) NOT NULL,
    MoTa        NVARCHAR(200),
    UpdatedBy   INT REFERENCES TAIKHOAN(MaTaiKhoan),
    UpdatedAt   DATETIME DEFAULT GETDATE()
)
```

**Bảng nghiệp vụ (theo thiết kế đã có):**

```
KHACHHANG       -- Thông tin hành khách
HANGTHANHVIEN   -- Hạng thành viên (Bronze, Silver, Gold, Platinum)
SANBAY          -- Danh mục sân bay
CHUYENBAY       -- Thông tin chuyến bay
TRUNGGIAN       -- Sân bay trung gian của chuyến bay
HANGVE          -- Hạng vé (Hạng 1, Hạng 2)
CT_HANGVE       -- Chi tiết ghế theo hạng trên từng chuyến bay
VE              -- Vé máy bay đã xuất
PHIEUDATCHO     -- Phiếu đặt giữ chỗ
THANHTOAN       -- Hóa đơn thanh toán
BANGGIA_HANHLY  -- Bảng giá hành lý (trước/tại sân bay)
GOIHANHLY       -- Gói hành lý khách mua
KIENHANHLY      -- Từng kiện hành lý trong gói
CHECKIN         -- Thông tin check-in online
```

**Conventions bắt buộc:**
- PK: `INT IDENTITY(1,1)` hoặc `VARCHAR(10)` tùy bảng
- Soft delete: thêm `IsDeleted BIT DEFAULT 0` cho VE, CHUYENBAY, KHACHHANG
- Timestamps: `CreatedAt DATETIME DEFAULT GETDATE()`, `UpdatedAt DATETIME DEFAULT GETDATE()`
- Index: tạo index cho tất cả FK column + các column thường dùng trong WHERE

**Index cần thiết:**
```sql
-- CHUYENBAY
CREATE INDEX IX_CHUYENBAY_SanBayDi ON CHUYENBAY(SanBayDi)
CREATE INDEX IX_CHUYENBAY_SanBayDen ON CHUYENBAY(SanBayDen)
CREATE INDEX IX_CHUYENBAY_NgayGioBay ON CHUYENBAY(NgayGioBay)

-- VE
CREATE INDEX IX_VE_MaChuyenBay ON VE(MaChuyenBay)
CREATE INDEX IX_VE_MaKhachHang ON VE(MaKhachHang)
CREATE INDEX IX_VE_TrangThaiVe ON VE(TrangThaiVe)

-- TAIKHOAN
CREATE INDEX IX_TAIKHOAN_TenDangNhap ON TAIKHOAN(TenDangNhap)
```

**Constraints nghiệp vụ:**
```sql
-- Không cho sân bay đi = sân bay đến
ALTER TABLE CHUYENBAY ADD CONSTRAINT CK_CHUYENBAY_SanBay
    CHECK (SanBayDi <> SanBayDen)

-- Thời gian bay tối thiểu 30 phút
ALTER TABLE CHUYENBAY ADD CONSTRAINT CK_CHUYENBAY_ThoiGian
    CHECK (ThoiGianBay >= 30)

-- Ghế không được âm
ALTER TABLE CT_HANGVE ADD CONSTRAINT CK_CTHANGVE_SoLuong
    CHECK (SoLuong >= 0 AND SoGheDaDat >= 0 AND SoGheDaDat <= SoLuong)

-- Trọng lượng kiện tối đa 32kg
ALTER TABLE KIENHANHLY ADD CONSTRAINT CK_KIEN_TrongLuong
    CHECK (TrongLuong > 0 AND TrongLuong <= 32)
```

#### File/Scripts cần tạo
```
database/schema/
├── 01_tables_system.sql      -- VAITRO, TAIKHOAN, REFRESH_TOKEN, AUDIT_LOG, APP_CONFIG
├── 02_tables_core.sql        -- KHACHHANG, HANGTHANHVIEN, SANBAY
├── 03_tables_flight.sql      -- CHUYENBAY, TRUNGGIAN, HANGVE, CT_HANGVE
├── 04_tables_ticket.sql      -- VE, PHIEUDATCHO
├── 05_tables_payment.sql     -- THANHTOAN
├── 06_tables_baggage.sql     -- BANGGIA_HANHLY, GOIHANHLY, KIENHANHLY
├── 07_tables_checkin.sql     -- CHECKIN
└── 08_indexes_constraints.sql
```

#### Tiêu chí hoàn thành
- [ ] Tất cả 19 bảng tạo thành công (14 nghiệp vụ + 5 hệ thống)
- [ ] Tất cả FK hợp lệ, không lỗi khi chạy script
- [ ] Tất cả CHECK CONSTRAINT hoạt động đúng
- [ ] Index đã được tạo cho FK columns
- [ ] Bảng CHECKIN có đúng thuộc tính theo BM11 (không nhầm với KIENHANHLY)
- [ ] Script có thể chạy lại (IF NOT EXISTS checks)

---

### Issue DB-03: Bảo mật Database

**Tag:** `database`, `security`, `priority-high`

#### Mục tiêu
Thiết lập tài khoản database riêng cho ứng dụng backend với nguyên tắc least privilege. Không bao giờ dùng tài khoản `sa` trong code.

#### Công việc cần làm
- [ ] Tạo SQL Server Login riêng cho app backend
- [ ] Tạo Database User từ Login đó
- [ ] Cấp quyền tối thiểu theo từng loại thao tác
- [ ] Revoke quyền không cần thiết
- [ ] Document rõ quyền nào được cấp cho lý do gì

#### Chi tiết kỹ thuật

**Script tạo user:**
```sql
-- Chạy với tài khoản sa (chỉ trong Docker setup)
CREATE LOGIN vetmaybay_app
    WITH PASSWORD = '$(APP_DB_PASSWORD)',
         CHECK_POLICY = ON,
         CHECK_EXPIRATION = OFF;

USE VeToMayBayDB;
CREATE USER vetmaybay_app FOR LOGIN vetmaybay_app;

-- Cấp quyền cần thiết
GRANT SELECT, INSERT, UPDATE ON SCHEMA::dbo TO vetmaybay_app;
GRANT DELETE ON VE TO vetmaybay_app;           -- Soft delete
GRANT DELETE ON PHIEUDATCHO TO vetmaybay_app;
GRANT EXECUTE ON SCHEMA::dbo TO vetmaybay_app; -- Stored procedures

-- KHÔNG cấp: DROP TABLE, CREATE TABLE, ALTER TABLE, TRUNCATE
-- KHÔNG cấp: quyền trên system tables
```

**Quyền chi tiết theo bảng:**

| Bảng | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| TAIKHOAN | ✅ | ✅ | ✅ (UpdatedAt, LastLogin, TrangThai) | ❌ |
| KHACHHANG | ✅ | ✅ | ✅ | ❌ (soft delete) |
| CHUYENBAY | ✅ | ✅ | ✅ | ❌ (soft delete) |
| VE | ✅ | ✅ | ✅ (TrangThaiVe) | ❌ (soft delete) |
| AUDIT_LOG | ✅ | ✅ | ❌ | ❌ |
| APP_CONFIG | ✅ | ✅ | ✅ | ❌ |

**Lưu ý bổ sung:**
- Connection string trong `.env`, không hardcode trong code
- Mã hóa mật khẩu user bằng BCrypt strength 12 tại backend
- Không log connection string ra file log
- Refresh Token lưu trong DB phải hash hoặc encrypt

#### File/Scripts cần tạo
```
database/init/
├── 02_create_user.sql      -- Tạo Login + User
└── 03_grant_permissions.sql -- GRANT/REVOKE
```

#### Tiêu chí hoàn thành
- [ ] Login `vetmaybay_app` tạo thành công
- [ ] User không có quyền DROP/CREATE/ALTER table
- [ ] User không thể truy cập database khác
- [ ] Script sử dụng biến từ `.env`, không hardcode password
- [ ] Document quyền đã cấp trong README

---

### Issue DB-04: Stored Procedures

**Tag:** `database`

#### Mục tiêu
Tạo các Stored Procedure cho nghiệp vụ phức tạp, đặc biệt là những thao tác cần transaction.

#### Khi nào dùng Stored Procedure
- Khi cần transaction phức tạp liên quan nhiều bảng
- Khi cần đảm bảo tính toàn vẹn dữ liệu ở tầng DB
- Khi logic cần chạy nhanh (giảm round-trip)
- Khi cần audit tự động

#### Danh sách Stored Procedures cần tạo

**1. sp_BanVe_Create**
- Input: MaChuyenBay, MaKhachHang, MaHangVe, NgayGiaoDich
- Logic:
  1. Kiểm tra chuyến bay còn tồn tại và chưa hết hạn bán (so với THAMSO ThoiGianDongBanVe)
  2. Kiểm tra còn ghế trong CT_HANGVE (SoLuong - SoGheDaDat > 0)
  3. Tính giá vé = GiaCoBan × TyLeGia
  4. INSERT INTO VE
  5. UPDATE CT_HANGVE SET SoGheDaDat = SoGheDaDat + 1
  6. COMMIT hoặc ROLLBACK
- Output: MaVe mới, GiaVe, hoặc error code

**2. sp_DatVe_Create**
- Input: MaChuyenBay, MaKhachHang, MaHangVe
- Logic:
  1. Kiểm tra điều kiện đặt vé (cách giờ bay >= TGDatVeChamNhat)
  2. Kiểm tra còn ghế
  3. INSERT INTO PHIEUDATCHO với TrangThai = 'DANG_GIU_CHO'
  4. Tính HanThanhToan = GETDATE() + ThoiHanThanhToan (từ APP_CONFIG)
  5. UPDATE SoGheDaDat
  6. COMMIT hoặc ROLLBACK
- Output: MaPhieuDat, HanThanhToan

**3. sp_DoiChuyenBay**
- Input: MaVe, MaChuyenBayMoi, NgayThucHien
- Logic:
  1. Kiểm tra vé tồn tại và trạng thái 'HOP_LE'
  2. Kiểm tra cùng tuyến bay (SanBayDi, SanBayDen phải khớp)
  3. Kiểm tra chuyến mới còn ghế
  4. Kiểm tra điều kiện thời gian đổi (>= ThoiGianChoPhepDoiVe trước giờ bay cũ)
  5. UPDATE VE SET MaChuyenBay = MaChuyenBayMoi, TrangThaiVe = 'DA_DOI'
  6. Hoàn ghế chuyến cũ
  7. Trừ ghế chuyến mới
  8. Tính và lưu phí đổi chuyến
  9. COMMIT hoặc ROLLBACK
- Output: Thông tin vé mới, phí đổi

**4. sp_HuyVe**
- Input: MaVe, NguoiHuy, LyDoHuy
- Logic:
  1. Kiểm tra vé tồn tại, TrangThaiVe = 'HOP_LE'
  2. Kiểm tra giờ hiện tại < giờ bay (chỉ hủy trước khi bay)
  3. Tính phí hủy và số tiền hoàn
  4. UPDATE VE SET TrangThaiVe = 'DA_HUY', IsDeleted = 1
  5. Hoàn ghế: UPDATE CT_HANGVE SET SoGheDaDat = SoGheDaDat - 1
  6. COMMIT
- Output: PhiHuy, SoTienHoanLai

**5. sp_ThanhToan_Create**
- Input: MaPhieuDat hoặc MaVe, HinhThucThanhToan, SoTienThanhToan
- Logic:
  1. Validate mã phiếu/vé tồn tại và chưa thanh toán
  2. Kiểm tra trong hạn thanh toán
  3. Kiểm tra số tiền đủ 100%
  4. Tính GiaSauThue = GiaGoc × (1 + ThuVAT)
  5. INSERT INTO THANHTOAN
  6. UPDATE PHIEUDATCHO SET TrangThai = 'DA_THANH_TOAN' (nếu từ đặt chỗ)
  7. UPDATE VE SET TrangThaiVe = 'HOP_LE' (nếu từ đặt chỗ)
  8. COMMIT
- Output: MaHoaDon, GiaSauThue

**6. sp_CheckIn_Online**
- Input: MaVe, ThoiDiemCheckIn
- Logic:
  1. Kiểm tra vé hợp lệ và đã thanh toán
  2. Lấy giờ khởi hành thực tế từ CHUYENBAY
  3. Kiểm tra cửa sổ check-in (mở trước N giờ, đóng trước M phút – từ APP_CONFIG)
  4. Xác định số ghế và cổng check-in
  5. INSERT INTO CHECKIN
  6. COMMIT
- Output: Thông tin boarding pass đầy đủ

**7. sp_AuditLog_Insert**
- Input: MaTaiKhoan, TenHanhDong, TenBang, MaBanGhi, DuLieuCu (JSON), DuLieuMoi (JSON), IpAddress
- Logic: INSERT INTO AUDIT_LOG
- Output: Id log mới
- Note: Luôn dùng WITH NOLOCK khi đọc audit log

**8. sp_Report_DoanhThuThang**
- Input: Nam (INT), Thang (INT)
- Logic: Tổng hợp doanh thu từ VE + GOIHANHLY join CHUYENBAY theo tháng/năm
- Output: ResultSet gồm MaChuyenBay, DoanhThuVe, DoanhThuHanhLy, SoVeBan, PhanTramTrenTong

**9. sp_Report_DoanhThuNam**
- Input: Nam (INT)
- Logic: Tổng hợp theo từng tháng trong năm
- Output: ResultSet 12 rows (Thang, SoChuyenBay, SoVe, DoanhThu, PhanTram)

**10. sp_HuyDatCho_Auto**
- Input: Không (chạy theo scheduler)
- Logic: UPDATE PHIEUDATCHO SET TrangThai = 'DA_HUY' WHERE HanThanhToan < GETDATE() AND TrangThai = 'DANG_GIU_CHO'; đồng thời hoàn ghế
- Note: Gọi bởi SQL Server Agent Job hoặc từ backend scheduler

#### Quy chuẩn viết Stored Procedure
```sql
CREATE PROCEDURE sp_[BanNghiepVu]_[HanhDong]
    @Param1 DataType,
    @Param2 DataType OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validate input
        -- Business logic
        -- Data manipulation
        
        COMMIT TRANSACTION;
        SELECT 0 AS ErrorCode, N'Thành công' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT ERROR_NUMBER() AS ErrorCode, ERROR_MESSAGE() AS Message;
    END CATCH
END
```

#### Tiêu chí hoàn thành
- [ ] sp_BanVe_Create hoạt động với transaction
- [ ] sp_DatVe_Create hoạt động với transaction
- [ ] sp_DoiChuyenBay với rollback khi lỗi
- [ ] sp_HuyVe với logic kiểm tra giờ bay
- [ ] sp_ThanhToan_Create
- [ ] sp_CheckIn_Online với kiểm tra cửa sổ thời gian
- [ ] sp_AuditLog_Insert (không transaction, fire and forget)
- [ ] sp_Report_DoanhThuThang
- [ ] sp_Report_DoanhThuNam
- [ ] sp_HuyDatCho_Auto
- [ ] Tất cả có error handling TRY/CATCH

---

### Issue DB-05: Triggers

**Tag:** `database`

#### Mục tiêu
Tạo trigger cần thiết để tự động hóa một số thao tác cần đảm bảo nhất quán dữ liệu.

#### ⚠️ Nguyên tắc sử dụng Trigger
- Chỉ dùng trigger cho thứ thật sự **cần chạy mọi lúc không phụ thuộc code** (auto UpdatedAt, audit log bắt buộc)
- Không dùng trigger cho business logic phức tạp → dễ gây bug khó debug
- Mỗi trigger phải được document rõ mục đích

#### Danh sách Triggers

**1. tr_AutoUpdateTimestamp** (áp dụng cho mọi bảng có UpdatedAt)
- Loại: AFTER UPDATE
- Áp dụng: TAIKHOAN, KHACHHANG, CHUYENBAY, VE, PHIEUDATCHO
- Logic: SET UpdatedAt = GETDATE() trên row bị UPDATE
```sql
CREATE TRIGGER tr_TAIKHOAN_AutoUpdateTimestamp
ON TAIKHOAN AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE TAIKHOAN SET UpdatedAt = GETDATE()
    WHERE MaTaiKhoan IN (SELECT MaTaiKhoan FROM inserted)
END
```

**2. tr_CHUYENBAY_PreventDelete** (quan trọng)
- Loại: INSTEAD OF DELETE
- Bảng: CHUYENBAY
- Logic: Nếu chuyến bay đã có VE hoặc PHIEUDATCHO thì ROLLBACK + RAISERROR; nếu chưa có thì soft delete (UPDATE IsDeleted = 1)
```sql
CREATE TRIGGER tr_CHUYENBAY_PreventDelete
ON CHUYENBAY INSTEAD OF DELETE AS
BEGIN
    IF EXISTS (SELECT 1 FROM VE v JOIN deleted d ON v.MaChuyenBay = d.MaChuyenBay WHERE v.IsDeleted = 0)
    BEGIN
        RAISERROR(N'Không thể xóa chuyến bay đã có vé', 16, 1);
        ROLLBACK;
        RETURN;
    END
    UPDATE CHUYENBAY SET IsDeleted = 1 WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM deleted)
END
```

**3. tr_TAIKHOAN_AuditLogin** (nếu không xử lý ở backend)
- Loại: AFTER UPDATE
- Logic: Khi cột LastLogin thay đổi → INSERT vào AUDIT_LOG với hành động 'USER_LOGIN'

**4. tr_APP_CONFIG_AuditChange**
- Loại: AFTER UPDATE
- Logic: Khi tham số quy định thay đổi → INSERT vào AUDIT_LOG với DuLieuCu và DuLieuMoi (JSON)

#### Cảnh báo hiệu năng
- Trigger AFTER INSERT/UPDATE chạy trong cùng transaction → nặng có thể làm chậm bán vé
- Tránh trigger gọi lại trigger (recursive)
- Trigger nên càng đơn giản càng tốt
- Audit log chi tiết nên ưu tiên xử lý ở Backend (Spring Boot AOP) thay vì trigger

#### Tiêu chí hoàn thành
- [ ] tr_AutoUpdateTimestamp cho 5 bảng chính
- [ ] tr_CHUYENBAY_PreventDelete hoạt động đúng
- [ ] tr_APP_CONFIG_AuditChange
- [ ] Tất cả trigger có comment mô tả

---

### Issue DB-06: Views

**Tag:** `database`

#### Mục tiêu
Tạo View phục vụ truy vấn phức tạp dùng nhiều lần, tối ưu cho dashboard và báo cáo.

#### Danh sách Views

**1. vw_ChuyenBayChiTiet**
```sql
-- Kết hợp CHUYENBAY + SANBAY (đi, đến) + thống kê ghế
-- Trả về: MaCB, SanBayDiCode, SanBayDiTen, SanBayDenCode, SanBayDenTen,
--          NgayGioBay, ThoiGianBay, GiaCoBan,
--          TongGheH1, GheDaBanH1, GheConH1,
--          TongGheH2, GheDaBanH2, GheConH2,
--          TrangThai
```

**2. vw_VeChiTiet**
```sql
-- Kết hợp VE + KHACHHANG + CHUYENBAY + HANGVE
-- Trả về: MaVe, HoTenKhach, CCCD, TenChuyenBay, TuyenBay,
--          NgayGioBay, TenHangVe, GiaVe, TrangThaiVe, NgayGiaoDich
-- WHERE IsDeleted = 0
```

**3. vw_PhieuDatChoChiTiet**
```sql
-- Kết hợp PHIEUDATCHO + KHACHHANG + CHUYENBAY + HANGVE
-- Gồm cả trạng thái và thời gian còn lại đến HanThanhToan
```

**4. vw_DashboardSummary**
```sql
-- View tổng hợp cho dashboard
-- Tổng vé hôm nay, doanh thu hôm nay, số chuyến hôm nay, số khách mới tháng này
-- (Dùng cho API dashboard, backend chỉ cần SELECT * FROM vw_DashboardSummary)
```

**5. vw_DoanhThuTheoChuyenBay**
```sql
-- Tổng hợp doanh thu theo từng chuyến bay
-- Gồm: doanh thu vé, doanh thu hành lý, tổng, số vé bán
```

**6. vw_AuditLogChiTiet**
```sql
-- Kết hợp AUDIT_LOG + TAIKHOAN
-- Gồm: TenDangNhap, TenHanhDong, TenBang, MaBanGhi, ThoiGian, IpAddress
```

**7. vw_HanhLyTheoVe**
```sql
-- Kết hợp VE + GOIHANHLY + KIENHANHLY
-- Thống kê số kiện, tổng kg, tổng tiền hành lý theo từng vé
```

#### Lưu ý
- View không được chứa logic nghiệp vụ phức tạp → chỉ JOIN và aggregate đơn giản
- View cho dashboard nên có `WITH NOEXPAND` hoặc indexed view nếu cần tốc độ
- Không tạo view cho thứ backend query đơn giản một bảng được

#### Tiêu chí hoàn thành
- [ ] 7 view tạo thành công, không lỗi cú pháp
- [ ] vw_DashboardSummary trả kết quả đúng
- [ ] vw_ChuyenBayChiTiet join đúng sân bay đi/đến
- [ ] Mỗi view có comment mô tả

---

### Issue DB-07: Functions

**Tag:** `database`

#### Mục tiêu
Tạo các inline function hoặc scalar function cần thiết, hạn chế scalar function gây chậm query.

#### ⚠️ Lưu ý hiệu năng
- **Tránh scalar function trong WHERE clause hoặc SELECT trên nhiều row** → rất chậm
- Ưu tiên dùng **inline table-valued function** thay thế
- Chỉ dùng scalar function cho tính toán đơn giản, gọi ít lần

#### Danh sách Functions cần tạo

**1. fn_TinhGiaVe** (Scalar Function)
- Input: @GiaCoBan DECIMAL, @MaHangVe INT
- Logic: Lấy TyLeGia từ HANGVE, tính GiaVe = GiaCoBan × TyLeGia
- Output: DECIMAL

**2. fn_TinhPhiHangLy** (Scalar Function)
- Input: @TongTrongLuong DECIMAL, @ThoiDiemMua DATETIME, @MaChuyenBay INT
- Logic: Xác định loại giá (trước/sau 3h), lấy DonGiaCoBan, tính phí
- Output: DECIMAL

**3. fn_KiemTraCuaSoCheckIn** (Scalar Function)
- Input: @NgayGioBay DATETIME, @ThoiDiemCheckIn DATETIME
- Logic: So sánh với APP_CONFIG ThoiGianMoCheckIn và ThoiGianDongCheckIn
- Output: BIT (1=hợp lệ, 0=không hợp lệ)

**4. fn_LayThamSo** (Scalar Function, dùng nhiều)
- Input: @ConfigKey VARCHAR
- Logic: SELECT ConfigValue FROM APP_CONFIG WHERE ConfigKey = @ConfigKey
- Output: NVARCHAR(500)
- Note: Cache ở tầng backend để giảm DB call

#### Tiêu chí hoàn thành
- [ ] 4 function tạo thành công
- [ ] Unit test từng function với dữ liệu mẫu
- [ ] Có comment ví dụ cách gọi

---

### Issue DB-08: Seed Data / Demo Data

**Tag:** `database`, `seed-data`, `priority-high`

#### Mục tiêu
Tạo dữ liệu demo đầy đủ để test toàn bộ tính năng của hệ thống mà không cần nhập tay.

#### Công việc cần làm
- [ ] Seed dữ liệu cho tất cả bảng hệ thống
- [ ] Seed dữ liệu cho tất cả bảng nghiệp vụ
- [ ] Script idempotent (chạy nhiều lần không lỗi)
- [ ] Có dữ liệu cho mọi trạng thái để test UI

#### Chi tiết Seed Data

**Tài khoản demo:**
```
admin@vetmaybay.com    / Pass: Admin@123      → Vai trò: Admin
staff@vetmaybay.com    / Pass: Staff@123      → Vai trò: Staff
agent@vetmaybay.com    / Pass: Agent@123      → Vai trò: Agent
user1@gmail.com        / Pass: User@123       → Vai trò: User (gắn KH-001)
user2@gmail.com        / Pass: User@123       → Vai trò: User (gắn KH-002)
```
⚠️ Ghi rõ trong README: "Mật khẩu demo chỉ dùng cho môi trường DEV. Thay đổi trước khi deploy production."

**Sân bay mẫu (10 sân bay):**
```
SGN - Tân Sơn Nhất, TP.HCM
HAN - Nội Bài, Hà Nội
DAD - Đà Nẵng
CXR - Cam Ranh, Khánh Hòa
HPH - Cát Bi, Hải Phòng
PQC - Phú Quốc
VCA - Cần Thơ
HUI - Phú Bài, Huế
BMV - Buôn Ma Thuột
VDH - Đồng Hới, Quảng Bình
```

**Chuyến bay mẫu (đa dạng trạng thái):**
- 5 chuyến bay hôm nay (2 đã bay, 2 đang bán, 1 sắp bay)
- 10 chuyến bay tuần tới (có đủ tuyến khác nhau)
- 3 chuyến bay đã hủy (để test UI trạng thái hủy)
- 2 chuyến bay có sân bay trung gian

**Khách hàng mẫu:**
- 10 khách hàng với hạng thành viên khác nhau
- 2 khách hàng có đủ lịch sử: vé hợp lệ, vé đã hủy, vé đã đổi, đặt chỗ chờ thanh toán

**Vé & Phiếu đặt chỗ mẫu:**
- 20 vé đã bán (trạng thái: HOP_LE, DA_HUY, DA_DOI)
- 5 phiếu đặt chỗ (DANG_GIU_CHO, DA_THANH_TOAN, DA_HUY)
- Đảm bảo có đủ số liệu cho dashboard hiển thị

**Thanh toán mẫu:**
- 15 hóa đơn đã thanh toán
- 3 hóa đơn chờ thanh toán

**Hành lý mẫu:**
- 8 gói hành lý với các kiện khác nhau

**Check-in mẫu:**
- 5 bản ghi check-in (để test boarding pass)

**APP_CONFIG mẫu:**
```sql
INSERT INTO APP_CONFIG VALUES
('THOI_GIAN_DONG_BAN_VE',     '24',    N'Số giờ trước giờ bay không còn bán vé'),
('THOI_GIAN_GIU_CHO',         '24',    N'Số giờ giữ chỗ tối đa chờ thanh toán'),
('PHI_DOI_VE',                 '200000',N'Phí đổi chuyến bay (VNĐ)'),
('PHI_HUY_VE',                 '100000',N'Phí hủy vé (VNĐ)'),
('PHI_NANG_HANG',              '10',    N'% phí dịch vụ nâng hạng'),
('THOI_HAN_THANH_TOAN',        '2',     N'Số giờ thời hạn thanh toán sau khi đặt'),
('TRONG_LUONG_TOID_KIEN',     '32',    N'Kg tối đa 1 kiện hành lý'),
('SO_KIEN_TOI_DA',             '15',    N'Số kiện tối đa cho 1 vé'),
('THUE_VAT',                   '10',    N'% thuế VAT'),
('THOI_GIAN_MO_CHECKIN',      '24',    N'Số giờ trước giờ bay mở check-in'),
('THOI_GIAN_DONG_CHECKIN',    '60',    N'Số phút trước giờ bay đóng check-in'),
('KY_BAO_CAO',                 'MONTH', N'Kỳ báo cáo mặc định: DAY/WEEK/MONTH/QUARTER/YEAR')
```

#### File/Scripts cần tạo
```
database/seed/
├── 01_seed_system.sql         -- VAITRO, TAIKHOAN, APP_CONFIG
├── 02_seed_airports.sql       -- SANBAY, HANGVE, HANGTHANHVIEN
├── 03_seed_customers.sql      -- KHACHHANG
├── 04_seed_flights.sql        -- CHUYENBAY, TRUNGGIAN, CT_HANGVE
├── 05_seed_tickets.sql        -- VE, PHIEUDATCHO
├── 06_seed_payments.sql       -- THANHTOAN
├── 07_seed_baggage.sql        -- BANGGIA_HANHLY, GOIHANHLY, KIENHANHLY
├── 08_seed_checkin.sql        -- CHECKIN
└── 09_seed_auditlogs.sql      -- AUDIT_LOG sample
```

#### Tiêu chí hoàn thành
- [ ] Script chạy thành công từ database trống
- [ ] Script idempotent (có `IF NOT EXISTS` hoặc `DELETE + INSERT`)
- [ ] Có đủ 5 tài khoản demo (admin, staff, agent, 2 users)
- [ ] Dashboard hiển thị dữ liệu sau seed (không empty state)
- [ ] Có vé ở mọi trạng thái (HOP_LE, DA_HUY, DA_DOI)
- [ ] Có chuyến bay ở mọi trạng thái
- [ ] README ghi rõ mật khẩu demo chỉ dùng cho DEV

---

### Issue DB-09: Backup, Restore & Migration

**Tag:** `database`, `docker`

#### Mục tiêu
Chuẩn hóa quy trình backup, restore và quản lý phiên bản schema database.

#### Backup

```bash
# Backup database ra file .bak
docker exec vetmaybaay_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "BACKUP DATABASE VeToMayBayDB TO DISK='/var/opt/mssql/backup/vetmaybay_$(date +%Y%m%d).bak'"
```

Script `db_backup.sh` cần:
- Tạo file .bak với timestamp
- Copy ra ngoài container (docker cp)
- Giữ tối đa N bản backup
- Ghi log kết quả

#### Restore

```bash
# Restore từ file .bak
docker exec vetmaybaay_sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "RESTORE DATABASE VeToMayBayDB FROM DISK='/var/opt/mssql/backup/vetmaybay_20250101.bak' WITH REPLACE"
```

#### Reset Database Dev

```bash
# Script reset toàn bộ database về trạng thái ban đầu (dev only)
# 1. Drop database nếu tồn tại
# 2. Chạy lại schema scripts
# 3. Chạy lại seed scripts
```
Script: `scripts/db_reset_dev.sh`

#### Quản lý Migration (Versioning Schema)

Vì dự án học thuật, dùng cách đơn giản: **numbered migration files**

```
database/migrations/
├── V001__create_initial_schema.sql
├── V002__add_audit_log.sql
├── V003__add_app_config.sql
├── V004__add_indexes.sql
└── V005__fix_checkin_table.sql    ← Fix bảng CHECKIN (từ checklist báo cáo)
```

Mỗi file: bắt đầu bằng kiểm tra version, thực hiện thay đổi, ghi vào bảng `SCHEMA_VERSION`.

#### Tiêu chí hoàn thành
- [ ] Script `db_backup.sh` chạy được
- [ ] Script `db_restore.sh` chạy được
- [ ] Script `db_reset_dev.sh` chạy được (chỉ cho dev)
- [ ] Có thư mục `migrations/` với file V001 là full schema
- [ ] README hướng dẫn đầy đủ

---

## 5. Backend Issues

---

### Issue BE-01: Setup Spring Boot Project

**Tag:** `backend`, `docker`, `priority-high`

#### Mục tiêu
Khởi tạo project Spring Boot với đầy đủ cấu hình cần thiết, kết nối SQL Server, chạy được bằng Docker.

#### Công việc cần làm
- [ ] Khởi tạo project bằng Spring Initializr
- [ ] Cấu trúc thư mục theo chuẩn
- [ ] Cấu hình kết nối SQL Server
- [ ] Cấu hình logging
- [ ] Cấu hình CORS
- [ ] Cấu hình Global Exception Handler
- [ ] Cấu hình Response format chuẩn
- [ ] Tích hợp Swagger/OpenAPI
- [ ] Tạo Dockerfile + docker-compose

#### Dependencies Spring Boot

```xml
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-actuator
com.microsoft.sqlserver:mssql-jdbc
io.jsonwebtoken:jjwt-api
springdoc-openapi-starter-webmvc-ui
org.projectlombok:lombok
org.mapstruct:mapstruct
```

#### Cấu trúc thư mục
```
src/main/java/com/vetmaybay/
├── config/               -- Security, CORS, Swagger config
├── controller/           -- REST Controllers (API endpoints)
├── service/              -- Business logic interfaces + implementations
├── repository/           -- JPA Repositories
├── entity/               -- JPA Entities (map với DB tables)
├── dto/                  -- Request/Response DTOs
├── mapper/               -- MapStruct mappers
├── exception/            -- Custom exceptions + Global handler
├── util/                 -- Helper classes
└── security/             -- JWT filter, UserDetails, etc.
```

#### application.yml
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://${DB_HOST:localhost}:${DB_PORT:1433};databaseName=${DB_NAME:VeToMayBayDB};encrypt=true;trustServerCertificate=true
    username: ${DB_USER:vetmaybay_app}
    password: ${DB_PASSWORD}
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate   # KHÔNG dùng create/update – schema quản lý bằng SQL scripts
    
app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiration: 3600000    # 1 giờ
    refresh-token-expiration: 2592000000 # 30 ngày
  cors:
    allowed-origins: ${CORS_ORIGINS:http://localhost:3000}
```

#### Tiêu chí hoàn thành
- [ ] `mvn spring-boot:run` chạy không lỗi
- [ ] Kết nối SQL Server thành công
- [ ] Swagger UI truy cập được tại `/swagger-ui.html`
- [ ] CORS cấu hình đúng
- [ ] Global exception handler trả JSON chuẩn
- [ ] `docker-compose up` chạy được cả backend + database

---

### Issue BE-02: Authentication API

**Tag:** `backend`, `security`, `api`, `priority-high`

#### Mục tiêu
Xây dựng hệ thống xác thực dùng JWT với refresh token, bảo vệ tất cả API cần quyền.

#### API Endpoints

| Method | Path | Mô tả | Quyền |
|---|---|---|---|
| POST | /api/auth/login | Đăng nhập | Public |
| POST | /api/auth/refresh | Lấy access token mới | Public (refresh token) |
| POST | /api/auth/logout | Đăng xuất, revoke token | Authenticated |
| GET | /api/auth/me | Thông tin tài khoản hiện tại | Authenticated |
| POST | /api/auth/register | Đăng ký (User role) | Public |
| PUT | /api/auth/change-password | Đổi mật khẩu | Authenticated |

#### Chi tiết kỹ thuật

**Login Flow:**
1. Validate username + password
2. Tải UserDetails từ DB, kiểm tra TrangThai = 1 (Active)
3. So sánh password với BCrypt hash (strength 12)
4. Tạo Access Token (JWT, 1 giờ) + Refresh Token (UUID, 30 ngày)
5. Lưu Refresh Token vào REFRESH_TOKEN table (hash trước khi lưu)
6. UPDATE TAIKHOAN SET LastLogin = GETDATE()
7. Gọi sp_AuditLog_Insert với hành động 'LOGIN'
8. Trả về: accessToken, refreshToken, expiresIn, userInfo

**JWT Payload:**
```json
{
  "sub": "userId",
  "username": "admin@vetmaybay.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**Chống Brute-force cơ bản:**
- Track số lần đăng nhập sai theo username (in-memory hoặc Redis nếu có)
- Sau 5 lần sai liên tiếp trong 15 phút → lock 15 phút
- Response error KHÔNG tiết lộ "sai username" hay "sai password" mà chỉ "thông tin đăng nhập không hợp lệ"

**Refresh Token Flow:**
1. Nhận refreshToken từ client
2. Hash refreshToken, tìm trong DB
3. Kiểm tra chưa hết hạn + chưa bị revoke
4. Tạo Access Token mới
5. Optional: Rotate refresh token (tạo mới, revoke cũ)
6. Trả về accessToken mới

**Logout:**
- Revoke Refresh Token (UPDATE IsRevoked = 1)
- Gọi sp_AuditLog_Insert với 'LOGOUT'

#### Tiêu chí hoàn thành
- [ ] Login trả JWT hợp lệ
- [ ] Refresh token hoạt động
- [ ] Logout revoke token
- [ ] Route không có JWT → 401
- [ ] Tài khoản bị lock → 403 với message rõ ràng
- [ ] Password so sánh bằng BCrypt (không plain text)
- [ ] Refresh token được hash khi lưu DB
- [ ] Test đăng nhập với 5 tài khoản demo thành công

---

### Issue BE-03: Authorization & RBAC

**Tag:** `backend`, `security`, `api`

#### Mục tiêu
Xây dựng hệ thống phân quyền theo vai trò (RBAC), bảo vệ từng endpoint theo role.

#### Mapping Role – Permission

| Endpoint | Admin | Staff | Agent | User |
|---|---|---|---|---|
| GET /api/flights | ✅ | ✅ | ✅ | ✅ |
| POST /api/flights | ✅ | ✅ | ❌ | ❌ |
| POST /api/tickets/sell | ✅ | ✅ | ✅ | ❌ |
| POST /api/tickets/book | ❌ | ❌ | ❌ | ✅ |
| GET /api/reports | ✅ | ✅ | ❌ | ❌ |
| PUT /api/config | ✅ | ✅ | ❌ | ❌ |
| POST /api/accounts | ✅ | ❌ | ❌ | ✅ (tự đăng ký) |
| DELETE /api/accounts/{id} | ✅ | ❌ | ❌ | ❌ |

#### Chi tiết kỹ thuật
- Dùng Spring Security `@PreAuthorize` với custom annotation hoặc SpEL
- Role lưu trong JWT claim `"role"`, đọc từ `JwtAuthenticationFilter`
- Custom `AccessDeniedHandler` → trả 403 JSON chuẩn
- Custom `AuthenticationEntryPoint` → trả 401 JSON chuẩn

```java
// Ví dụ annotation
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'AGENT')")
@PostMapping("/sell")
public ResponseEntity<TicketResponse> sellTicket(@RequestBody SellTicketRequest req) { ... }

@PreAuthorize("hasRole('USER')")
@PostMapping("/book")
public ResponseEntity<BookingResponse> bookTicket(@RequestBody BookTicketRequest req) { ... }
```

**User chỉ xem được dữ liệu của mình:**
- User khi gọi `GET /api/tickets/my` → chỉ lấy vé của MaKhachHang tương ứng với account đó
- Không cần truyền ID trong path, lấy từ JWT token

#### Tiêu chí hoàn thành
- [ ] Endpoint phân quyền đúng theo bảng mapping
- [ ] 401 khi không có token
- [ ] 403 khi không đủ quyền
- [ ] User chỉ xem được dữ liệu của mình
- [ ] Test với 4 tài khoản demo (admin, staff, agent, user)

---

### Issue BE-04: API Quản lý Chuyến bay

**Tag:** `backend`, `api`

#### Mục tiêu
Xây dựng CRUD API cho module chuyến bay.

#### API Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | /api/flights | Danh sách chuyến bay (filter, phân trang) |
| GET | /api/flights/{id} | Chi tiết chuyến bay |
| POST | /api/flights | Tạo chuyến bay mới |
| PUT | /api/flights/{id} | Cập nhật chuyến bay |
| DELETE | /api/flights/{id} | Hủy chuyến bay (soft delete) |
| GET | /api/flights/search | Tìm kiếm theo tuyến + ngày (cho User đặt vé) |

#### Query Parameters cho GET /api/flights
- `sanBayDi`, `sanBayDen`: mã sân bay
- `ngayBay`: định dạng yyyy-MM-dd
- `trangThai`: ACTIVE, CANCELLED, COMPLETED
- `page`, `size`: phân trang (default: page=0, size=20)
- `sort`: ngayGioBay,asc

#### Validation
- SanBayDi ≠ SanBayDen
- NgayGioBay > GETDATE() (không tạo chuyến bay trong quá khứ)
- ThoiGianBay >= 30 phút
- SoLuong ghế H1, H2 > 0
- GiaCoBan > 0

#### Business Logic
- Khi DELETE (hủy): gọi trigger hoặc kiểm tra ở Service, nếu đã có vé → throw BusinessException("Không thể hủy chuyến bay đã có vé")
- Khi tạo chuyến bay có sân bay trung gian: validate tối đa 2 sân bay, thời gian dừng 10–20 phút

#### Tiêu chí hoàn thành
- [ ] CRUD hoạt động đúng
- [ ] Filter và phân trang hoạt động
- [ ] Validation đúng (không tạo CB sân bay đi = đến, v.v.)
- [ ] Không hủy được chuyến bay đã có vé
- [ ] Soft delete (IsDeleted = 1, không xóa vật lý)
- [ ] Audit log ghi khi tạo/sửa/hủy

---

### Issue BE-05: API Bán vé & Đặt vé

**Tag:** `backend`, `api`, `priority-high`

#### Mục tiêu
Xây dựng API bán vé tại quầy và đặt vé online, bao gồm đổi chuyến và hủy vé.

#### API Endpoints

| Method | Path | Mô tả | Role |
|---|---|---|---|
| POST | /api/tickets/sell | Bán vé tại quầy | Admin, Staff, Agent |
| POST | /api/bookings | Đặt giữ chỗ | User |
| GET | /api/tickets | Danh sách vé | Admin, Staff |
| GET | /api/tickets/my | Vé của tôi | User |
| GET | /api/tickets/{id} | Chi tiết vé | All (theo quyền) |
| PUT | /api/tickets/{id}/change-flight | Đổi chuyến bay | Admin, Staff |
| PUT | /api/tickets/{id}/upgrade | Nâng hạng ghế | Admin, Staff |
| DELETE | /api/tickets/{id} | Hủy vé | Admin, Staff, User (vé của mình) |
| GET | /api/bookings | Danh sách đặt chỗ | Admin, Staff |
| DELETE | /api/bookings/{id} | Hủy đặt chỗ | Admin, Staff, User |

#### Business Logic (gọi Stored Procedure)
- Bán vé → gọi `sp_BanVe_Create`
- Đặt vé → gọi `sp_DatVe_Create`
- Đổi chuyến → gọi `sp_DoiChuyenBay`
- Hủy vé → gọi `sp_HuyVe`

#### Response format bán vé
```json
{
  "status": "success",
  "data": {
    "maVe": "V20250101001",
    "maChuyenBay": "CB001",
    "tenKhachHang": "Nguyễn Văn A",
    "hangVe": "Hạng 1",
    "giaVe": 2520000,
    "trangThaiVe": "HOP_LE",
    "ngayGiaoDich": "2025-01-01T10:30:00"
  }
}
```

#### Tiêu chí hoàn thành
- [ ] Bán vé thành công, ghế giảm 1
- [ ] Không bán vé khi hết ghế → 409 Conflict
- [ ] Không bán vé sau thời gian đóng bán → 400 Bad Request
- [ ] Đặt vé tạo phiếu đặt chỗ, tự động hủy khi hết hạn
- [ ] Đổi chuyến kiểm tra cùng tuyến
- [ ] Hủy vé cập nhật ghế trống
- [ ] Audit log đầy đủ

---

### Issue BE-06: API Hành lý, Thanh toán & Check-in

**Tag:** `backend`, `api`

#### Mục tiêu
Xây dựng API cho hành lý ký gửi, thanh toán và check-in online.

#### Hành lý Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | /api/baggage/pricing | Bảng giá hành lý |
| POST | /api/baggage | Đăng ký gói hành lý cho vé |
| GET | /api/baggage/ticket/{maVe} | Hành lý của vé |
| DELETE | /api/baggage/{id} | Hủy kiện hành lý |

#### Thanh toán Endpoints

| Method | Path | Mô tả |
|---|---|---|
| POST | /api/payments | Tạo thanh toán |
| GET | /api/payments/{id} | Chi tiết hóa đơn |
| GET | /api/payments | Danh sách hóa đơn (filter) |

#### Check-in Endpoints

| Method | Path | Mô tả |
|---|---|---|
| POST | /api/checkin | Thực hiện check-in online |
| GET | /api/checkin/{maVe} | Lấy boarding pass |

#### Business Logic
- Hành lý: kiểm tra mỗi kiện ≤ 32kg, tổng kiện ≤ 15; tính phí theo bảng giá (trước/sau 3h)
- Thanh toán: gọi `sp_ThanhToan_Create`; kiểm tra đủ 100%, trong hạn
- Check-in: gọi `sp_CheckIn_Online`; kiểm tra cửa sổ thời gian từ APP_CONFIG

#### Tiêu chí hoàn thành
- [ ] Đăng ký hành lý tính đúng phí
- [ ] Từ chối kiện > 32kg
- [ ] Thanh toán tạo hóa đơn với VAT đúng
- [ ] Check-in chỉ thành công trong cửa sổ thời gian
- [ ] Check-in không được nếu chưa thanh toán
- [ ] Boarding pass có đủ thông tin

---

### Issue BE-07: API Dashboard & Báo cáo

**Tag:** `backend`, `api`

#### Mục tiêu
Xây dựng API cung cấp dữ liệu cho dashboard và báo cáo doanh thu.

#### API Endpoints

| Method | Path | Mô tả | Role |
|---|---|---|---|
| GET | /api/dashboard/summary | Số liệu tổng quan | Admin, Staff |
| GET | /api/dashboard/charts/revenue | Doanh thu 30 ngày | Admin, Staff |
| GET | /api/dashboard/charts/tickets | Phân bổ hạng vé | Admin, Staff |
| GET | /api/dashboard/recent/tickets | Vé bán gần đây | Admin, Staff |
| GET | /api/dashboard/today/flights | Chuyến bay hôm nay | Admin, Staff |
| GET | /api/reports/monthly | Báo cáo tháng | Admin, Staff |
| GET | /api/reports/yearly | Báo cáo năm | Admin, Staff |
| GET | /api/reports/export | Export Excel/PDF | Admin, Staff |

#### Chi tiết
- `GET /api/dashboard/summary` → gọi `vw_DashboardSummary`
- `GET /api/reports/monthly?year=2025&month=1` → gọi `sp_Report_DoanhThuThang`
- `GET /api/reports/yearly?year=2025` → gọi `sp_Report_DoanhThuNam`
- Export sử dụng Apache POI (Excel) hoặc iText (PDF)

#### Tiêu chí hoàn thành
- [ ] Dashboard summary trả dữ liệu đúng sau seed
- [ ] Chart data trả đúng format cho frontend
- [ ] Báo cáo tháng/năm đúng số liệu
- [ ] Export Excel chạy được
- [ ] Endpoint được bảo vệ đúng role

---

### Issue BE-08: API Quản lý Tài khoản & Quy định

**Tag:** `backend`, `api`, `security`

#### Mục tiêu
Xây dựng API quản lý tài khoản (Admin) và quản lý tham số quy định nghiệp vụ.

#### Tài khoản Endpoints (Admin only)

| Method | Path | Mô tả |
|---|---|---|
| GET | /api/accounts | Danh sách tài khoản |
| POST | /api/accounts | Tạo tài khoản (Admin tạo Staff/Agent) |
| PUT | /api/accounts/{id} | Cập nhật thông tin |
| PUT | /api/accounts/{id}/status | Khóa/Mở tài khoản |
| PUT | /api/accounts/{id}/reset-password | Admin reset mật khẩu |

#### Quy định Endpoints

| Method | Path | Mô tả | Role |
|---|---|---|---|
| GET | /api/config | Lấy tất cả quy định | Admin, Staff |
| GET | /api/config/{key} | Lấy quy định theo key | Admin, Staff |
| PUT | /api/config/{key} | Cập nhật quy định | Admin, Staff |
| PUT | /api/config/batch | Cập nhật nhiều quy định | Admin, Staff |

#### Business Logic
- Khi cập nhật quy định → audit log ghi lại giá trị cũ/mới
- Validate miền giá trị hợp lệ (ví dụ TRONG_LUONG_TOID_KIEN phải từ 1–50)
- Thay đổi quy định có hiệu lực ngay với các giao dịch mới (không ảnh hưởng giao dịch cũ)

#### Tiêu chí hoàn thành
- [ ] Tạo tài khoản Staff/Agent (Admin)
- [ ] Khóa tài khoản → đăng nhập bị từ chối
- [ ] Cập nhật quy định → ghi audit log
- [ ] Validate miền giá trị

---

### Issue BE-09: Error Handling & Response Format

**Tag:** `backend`, `api`, `priority-high`

#### Mục tiêu
Chuẩn hóa toàn bộ response format của API, đảm bảo frontend xử lý nhất quán.

#### Response Format chuẩn

**Success:**
```json
{
  "status": "success",
  "code": 200,
  "message": "Thành công",
  "data": { ... },
  "timestamp": "2025-01-01T10:30:00",
  "requestId": "uuid-v4"
}
```

**List với phân trang:**
```json
{
  "status": "success",
  "code": 200,
  "data": [ ... ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "sanBayDi", "message": "Sân bay đi không được để trống" },
    { "field": "ngayGioBay", "message": "Ngày bay phải lớn hơn ngày hiện tại" }
  ],
  "timestamp": "2025-01-01T10:30:00",
  "requestId": "uuid-v4"
}
```

**HTTP Status Codes:**
- 200: Thành công
- 201: Tạo mới thành công
- 400: Validation error / Bad request
- 401: Chưa đăng nhập
- 403: Không có quyền
- 404: Không tìm thấy
- 409: Conflict (trùng dữ liệu, không đủ ghế)
- 422: Business rule violation (hủy vé đã bay)
- 500: Lỗi server

#### Business Exceptions

```java
class TicketNotFoundException extends BaseException       // 404
class InsufficientSeatsException extends BaseException    // 409
class FlightCancelledException extends BaseException      // 409
class PaymentExpiredException extends BaseException       // 422
class CheckInWindowException extends BaseException        // 422
class PermissionDeniedException extends BaseException     // 403
```

#### Tiêu chí hoàn thành
- [ ] Tất cả endpoint trả đúng format
- [ ] Validation error list tất cả fields lỗi
- [ ] Business exception trả message tiếng Việt rõ ràng
- [ ] 500 error không lộ stack trace ra client
- [ ] Request ID có trong mọi response

---

### Issue BE-10: Docker cho Backend

**Tag:** `backend`, `docker`

#### Mục tiêu
Đóng gói backend Spring Boot trong Docker, tích hợp với SQL Server container.

#### Công việc cần làm
- [ ] Tạo `Dockerfile` cho Spring Boot
- [ ] Cập nhật `docker-compose.yml` thêm service backend
- [ ] Cấu hình network giữa backend và sqlserver
- [ ] Cấu hình healthcheck cho backend
- [ ] Đảm bảo backend chờ sqlserver sẵn sàng trước khi start

#### Dockerfile
```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml (phần backend)
```yaml
backend:
  build: ./backend
  container_name: vetmaybay_backend
  ports:
    - "8080:8080"
  environment:
    DB_HOST: sqlserver
    DB_PORT: 1433
    DB_NAME: ${DB_NAME}
    DB_USER: ${APP_DB_USER}
    DB_PASSWORD: ${APP_DB_PASSWORD}
    JWT_SECRET: ${JWT_SECRET}
  depends_on:
    sqlserver:
      condition: service_healthy
  networks:
    - vetmaybay_network
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/actuator/health"]
    interval: 30s
    retries: 5
    start_period: 60s
```

#### Tiêu chí hoàn thành
- [ ] `docker-compose up` khởi động thành công cả 2 service
- [ ] Backend chờ SQL Server healthy mới start
- [ ] API `/actuator/health` trả `UP`
- [ ] Multi-stage build giảm kích thước image
- [ ] Environment variables đúng

---

## 6. Roadmap triển khai

### Giai đoạn 1: Phân tích & Thiết kế *(Tuần 1)*

**Mục tiêu:** Chốt toàn bộ thiết kế trước khi code.

**Công việc:**
- Chốt danh sách entity và quan hệ dữ liệu
- Chốt mapping role–permission
- Review và approve schema DB
- Thiết kế Design System Figma (F-01)
- Thiết kế Layout & Navigation (F-02)

**Đầu ra cần có:**
- ✅ Schema DB được approve bởi toàn team
- ✅ Design System Figma đã có
- ✅ Layout chính đã thiết kế

**Điều kiện chuyển giai đoạn:** Schema approved, Design System approved.

---

### Giai đoạn 2: Nền tảng kỹ thuật *(Tuần 2)*

**Mục tiêu:** Setup đủ hạ tầng để bắt đầu code feature.

**Công việc:**
- DB-01: Docker SQL Server
- DB-02: Schema database (tất cả bảng)
- DB-03: Security database (user, quyền)
- BE-01: Setup Spring Boot
- BE-02: Authentication API
- F-03: Màn hình đăng nhập (Figma)

**Đầu ra cần có:**
- ✅ `docker-compose up` chạy được DB + Backend
- ✅ Login API hoạt động với JWT
- ✅ Figma màn hình đăng nhập

**Điều kiện chuyển giai đoạn:** Login được, JWT valid, kết nối DB thành công.

---

### Giai đoạn 3: Module lõi *(Tuần 3–4)*

**Mục tiêu:** Xây dựng các nghiệp vụ chính.

**Song song:**
- DB-04: Stored Procedures (sp_BanVe, sp_DatVe, sp_HuyVe, sp_DoiChuyen)
- DB-05: Triggers
- DB-08: Seed Data
- BE-03: Authorization/RBAC
- BE-04: API Chuyến bay
- BE-05: API Bán vé & Đặt vé
- F-04: Dashboard Figma
- F-05: Module Chuyến bay Figma
- F-06: Module Bán vé Figma

**Đầu ra cần có:**
- ✅ Bán vé thành công từ end-to-end
- ✅ Đặt vé, đổi chuyến, hủy vé hoạt động
- ✅ Figma module chuyến bay + bán vé xong

---

### Giai đoạn 4: Module phụ trợ *(Tuần 5)*

**Công việc:**
- BE-06: Hành lý, Thanh toán, Check-in
- DB-06: Views
- DB-07: Functions
- F-07: Màn hình Hành lý & Check-in (Figma)
- F-08: Màn hình Thanh toán & Báo cáo (Figma)
- F-09: Quản lý tài khoản & Quy định (Figma)

**Đầu ra cần có:**
- ✅ Check-in online xuất Boarding Pass
- ✅ Báo cáo doanh thu tháng/năm
- ✅ Tất cả Figma screens xong

---

### Giai đoạn 5: Hoàn thiện & Testing *(Tuần 6)*

**Công việc:**
- BE-07: Dashboard & Báo cáo API
- BE-08: Quản lý tài khoản & Quy định API
- BE-09: Error handling chuẩn
- DB-09: Backup/Restore plan
- Test toàn bộ luồng với seed data
- Fix bug
- Code review

**Đầu ra cần có:**
- ✅ Tất cả API hoạt động đúng
- ✅ Dashboard hiển thị số liệu sau seed
- ✅ Tất cả role test thành công

---

### Giai đoạn 6: Docker hóa & Tài liệu *(Tuần 7)*

**Công việc:**
- BE-10: Docker cho backend
- Viết README đầy đủ
- Viết API documentation (Swagger)
- Security review
- Chuẩn bị demo

**Đầu ra cần có:**
- ✅ `docker-compose up` chạy cả hệ thống
- ✅ README hướng dẫn đầy đủ
- ✅ Swagger UI accessible

---

## 7. Thứ tự ưu tiên

| Thứ tự | Nhóm việc | Lý do ưu tiên | Song song với |
|---|---|---|---|
| 1 | DB-02 Schema Database | Mọi thứ phụ thuộc vào schema | F-01 Design System |
| 2 | DB-01 Docker Setup | Cần có DB để chạy backend | BE-01 Project Setup |
| 3 | DB-03 DB Security | Bảo mật phải từ đầu | BE-02 Auth API |
| 4 | BE-02 Authentication | Blocking cho mọi API có auth | F-03 Login Screen |
| 5 | BE-09 Response Format | Standard trước khi code API | DB-04 Stored Procs |
| 6 | BE-03 RBAC | Cần trước khi test quyền | DB-05 Triggers |
| 7 | DB-08 Seed Data | Cần dữ liệu để test | F-04, F-05 Figma |
| 8 | BE-04 Chuyến bay API | Module cơ bản nhất | F-06 Figma bán vé |
| 9 | BE-05 Bán vé API | Nghiệp vụ cốt lõi | DB-06 Views |
| 10 | BE-06 Hành lý/TT/CK | Phụ thuộc vé đã tạo | F-07, F-08 Figma |
| 11 | BE-07 Dashboard API | Cần seed data xong | DB-07 Functions |
| 12 | BE-08 Account/Config | Ít phụ thuộc nghiệp vụ | F-09 Figma |
| 13 | DB-09 Backup/Restore | Cuối cùng, dev không block | BE-10 Docker |
| 14 | BE-10 Docker Backend | Sau khi backend ổn định | – |

**Có thể làm song song:**
- Figma (F-01 đến F-09) và Database (DB-01 đến DB-09) không block nhau
- BE-01 và DB-01 có thể làm cùng lúc
- DB-04 Stored Procedure và BE-03 RBAC có thể làm song song

---

## 8. Checklist hoàn thành

### ✅ Database Checklist

**Setup & Hạ tầng:**
- [ ] SQL Server chạy được bằng Docker (`docker-compose up`)
- [ ] Healthcheck container PASS
- [ ] Có file `.env.example` đủ biến
- [ ] `.env` không commit lên git (trong `.gitignore`)
- [ ] Kết nối được từ SSMS/Azure Data Studio

**Schema:**
- [ ] Tất cả 19 bảng tạo thành công (14 nghiệp vụ + 5 hệ thống)
- [ ] Tất cả Primary Key đúng
- [ ] Tất cả Foreign Key đúng, không lỗi
- [ ] Có Index cho FK columns và cột WHERE thường dùng
- [ ] Có CHECK CONSTRAINT cho nghiệp vụ (sân bay, trọng lượng, ghế)
- [ ] Có `CreatedAt`, `UpdatedAt` ở bảng cần thiết
- [ ] Có soft delete (`IsDeleted`) ở VE, CHUYENBAY, KHACHHANG
- [ ] Bảng CHECKIN có đúng cột (không nhầm với KIENHANHLY)

**Bảo mật:**
- [ ] Tài khoản `vetmaybay_app` đã tạo
- [ ] Không dùng `sa` trong application
- [ ] Quyền tối thiểu đã cấp đúng
- [ ] Script quyền có comment giải thích

**Stored Procedures:**
- [ ] sp_BanVe_Create (với transaction)
- [ ] sp_DatVe_Create (với transaction)
- [ ] sp_DoiChuyenBay (với transaction + rollback)
- [ ] sp_HuyVe (với kiểm tra giờ bay)
- [ ] sp_ThanhToan_Create
- [ ] sp_CheckIn_Online (với kiểm tra cửa sổ thời gian)
- [ ] sp_AuditLog_Insert
- [ ] sp_Report_DoanhThuThang
- [ ] sp_Report_DoanhThuNam
- [ ] sp_HuyDatCho_Auto (chạy tự động)

**Triggers:**
- [ ] tr_AutoUpdateTimestamp cho bảng cần thiết
- [ ] tr_CHUYENBAY_PreventDelete hoạt động đúng
- [ ] tr_APP_CONFIG_AuditChange

**Views:**
- [ ] vw_ChuyenBayChiTiet
- [ ] vw_VeChiTiet
- [ ] vw_DashboardSummary
- [ ] vw_DoanhThuTheoChuyenBay
- [ ] vw_AuditLogChiTiet
- [ ] vw_HanhLyTheoVe
- [ ] vw_PhieuDatChoChiTiet

**Functions:**
- [ ] fn_TinhGiaVe
- [ ] fn_TinhPhiHangLy
- [ ] fn_KiemTraCuaSoCheckIn
- [ ] fn_LayThamSo

**Seed Data:**
- [ ] 5 tài khoản demo (admin, staff, agent, 2 user)
- [ ] 10 sân bay
- [ ] Đủ chuyến bay ở mọi trạng thái
- [ ] Đủ vé ở mọi trạng thái
- [ ] Dashboard không empty sau seed
- [ ] Mật khẩu demo được ghi rõ chỉ dùng DEV

**Vận hành:**
- [ ] Script backup chạy được
- [ ] Script restore chạy được
- [ ] Script reset dev chạy được
- [ ] Thư mục migrations/ có V001 full schema

---

### ✅ Backend Checklist

**Setup:**
- [ ] `mvn spring-boot:run` chạy không lỗi
- [ ] Kết nối SQL Server thành công
- [ ] Swagger UI truy cập được
- [ ] CORS cấu hình đúng
- [ ] Response format chuẩn cho tất cả endpoint
- [ ] Global exception handler hoạt động

**Authentication:**
- [ ] Login trả JWT hợp lệ
- [ ] Refresh token hoạt động
- [ ] Logout revoke token
- [ ] Password dùng BCrypt (strength 12)
- [ ] Refresh token được hash khi lưu DB
- [ ] Route không token → 401

**Authorization:**
- [ ] RBAC đúng theo bảng mapping role–permission
- [ ] 403 khi thiếu quyền
- [ ] User chỉ xem dữ liệu của mình

**API Module:**
- [ ] CRUD Chuyến bay hoạt động
- [ ] Bán vé (gọi SP, giảm ghế, audit log)
- [ ] Đặt vé, đổi chuyến, hủy vé hoạt động
- [ ] Hành lý ký gửi (validate 32kg, tính phí)
- [ ] Thanh toán (VAT, kiểm tra hạn)
- [ ] Check-in online (cửa sổ thời gian)
- [ ] Dashboard API trả đúng số liệu
- [ ] Báo cáo tháng/năm
- [ ] Quản lý tài khoản (Admin)
- [ ] Quản lý quy định (Admin/Staff)

**Docker:**
- [ ] Dockerfile build thành công
- [ ] `docker-compose up` chạy cả backend + DB
- [ ] Backend chờ DB healthy
- [ ] `/actuator/health` trả UP

---

### ✅ Figma Checklist

**Design System:**
- [ ] Color Styles đầy đủ
- [ ] Typography Styles đầy đủ
- [ ] Component Button (5 variant)
- [ ] Component Input (6 loại)
- [ ] Component Table
- [ ] Component Card (3 loại)
- [ ] Component Modal
- [ ] Component Badge/Tag
- [ ] Toast Notification
- [ ] Empty/Loading/Error state
- [ ] Tất cả component dùng Auto Layout

**Layout & Navigation:**
- [ ] Desktop layout (sidebar + content)
- [ ] Tablet layout
- [ ] Mobile layout
- [ ] Sidebar mở/thu gọn
- [ ] Header với user dropdown
- [ ] Breadcrumb
- [ ] Menu items theo 4 vai trò

**Màn hình:**
- [ ] Đăng nhập (desktop + mobile)
- [ ] Dashboard Admin/Staff
- [ ] Dashboard Agent
- [ ] Dashboard User/Portal
- [ ] Danh sách chuyến bay
- [ ] Chi tiết chuyến bay
- [ ] Form tạo/sửa chuyến bay
- [ ] Wizard bán vé (3 bước)
- [ ] Đặt vé online
- [ ] Danh sách vé + filter
- [ ] Modal đổi chuyến/hủy vé/nâng hạng
- [ ] Hành lý ký gửi
- [ ] Check-in + Boarding Pass
- [ ] Danh sách hóa đơn
- [ ] Báo cáo tháng/năm
- [ ] Quản lý tài khoản
- [ ] Quản lý quy định

**Quality:**
- [ ] Responsive desktop/tablet/mobile cho màn hình chính
- [ ] Có flow rõ ràng cho từng vai trò
- [ ] Có đủ trạng thái: loading, empty, error, success
- [ ] Màu sắc nhất quán với Design System
- [ ] Spacing nhất quán (base 4px)

---

*Tài liệu này được tạo dựa trên báo cáo thiết kế phần mềm Quản lý Bán Vé Máy Bay (SE104.Q22).*  
*Version: 1.0 | Cập nhật: 2025*
