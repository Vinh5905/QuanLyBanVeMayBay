INSERT INTO VAITRO (TenVaiTro, MoTa, CreatedAt) VALUES
('Admin', 'Quản trị viên hệ thống', CURRENT_TIMESTAMP),
('NhanVien', 'Nhân viên hãng hàng không', CURRENT_TIMESTAMP),
('DaiLy', 'Đại lý bán vé', CURRENT_TIMESTAMP),
('KhachHang', 'Khách hàng', CURRENT_TIMESTAMP);

INSERT INTO TAIKHOAN (TenDangNhap, MatKhauHash, MaVaiTro, Email, TrangThai, CreatedAt, UpdatedAt)
SELECT 'admin', '$2b$10$oGksCtG5X/a0nl8r68BQk.cm9gbws24VV2nJypV5kJPxxlkZwWg7W', MaVaiTro, 'admin@airline.vn', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM VAITRO WHERE TenVaiTro = 'Admin'
UNION ALL
SELECT 'staff', '$2b$10$ICSCkPViy.QyuHZBTBkMEeq179FIaBO10HwvrLf2EBX6t.LMWPEJS', MaVaiTro, 'staff@airline.vn', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM VAITRO WHERE TenVaiTro = 'NhanVien'
UNION ALL
SELECT 'agent', '$2b$10$CqrezJEjtevwSv8m.jsgfONYjTebKVk2.eWpOVQX5vOg8qm9elW3W', MaVaiTro, 'agent@airline.vn', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM VAITRO WHERE TenVaiTro = 'DaiLy'
UNION ALL
SELECT 'user1', '$2b$10$fGKJESrDGnAVYb6PdFB33u4lVfMg65qx0Ii68aYDE7boxjrwkRNvG', MaVaiTro, 'user1@example.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM VAITRO WHERE TenVaiTro = 'KhachHang'
UNION ALL
SELECT 'user2', '$2b$10$fGKJESrDGnAVYb6PdFB33u4lVfMg65qx0Ii68aYDE7boxjrwkRNvG', MaVaiTro, 'user2@example.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM VAITRO WHERE TenVaiTro = 'KhachHang';
