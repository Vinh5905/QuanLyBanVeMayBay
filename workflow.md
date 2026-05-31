# GitHub Workflow

Tài liệu này quy định cách tạo issue, branch, commit và pull request (PR) cho dự án **Phần Mềm Quản Lý Bán Vé Máy Bay**.

## 1. Nguyên tắc chung

- Mỗi branch chỉ xử lý một GitHub issue chính.
- Tạo GitHub issue trước khi bắt đầu code.
- Không commit trực tiếp vào `main`.
- Tạo branch mới từ phiên bản mới nhất của `main`.
- PR phải nhỏ, tập trung vào đúng phạm vi issue và đủ thông tin để review.
- Không commit secret hoặc file môi trường thật như `.env`, mật khẩu, token, connection string thật.

## 2. Phân biệt mã roadmap và GitHub issue

File `project_roadmap_github_issues.md` dùng mã công việc để phân nhóm:

| Nhóm | Mã roadmap | Ví dụ |
|---|---|---|
| Figma | `F-<số>` | `F-03` |
| Database | `DB-<số>` | `DB-02` |
| Backend | `BE-<số>` | `BE-05` |
| Frontend ReactJS | `FE-<số>` | `FE-06` |

Sau khi tạo issue trên GitHub, GitHub sẽ cấp một số issue thật, ví dụ `#12`.

- Dùng mã roadmap như `BE-05` trong tên branch và phần **Roadmap Task** của PR.
- Dùng số GitHub issue như `#12` trong `Closes #12` để GitHub tự đóng issue khi merge PR.
- Không viết `Closes #BE-05` vì đây không phải cú pháp GitHub issue hợp lệ.

## 3. Tạo GitHub issue

Mỗi issue cần có tối thiểu:

- Tiêu đề bắt đầu bằng mã roadmap, ví dụ: `[BE-05] Xây dựng API bán vé và đặt vé`.
- Mục tiêu và phạm vi thực hiện.
- Tiêu chí hoàn thành dưới dạng checklist.
- Label phù hợp từ roadmap, ví dụ: `backend`, `frontend`, `reactjs`, `database`, `api`, `security`, `docker`, `figma`, `seed-data`, `priority-high`.
- Dependency hoặc issue liên quan nếu có.

## 4. Đặt tên branch

Format:

```text
<type>/<roadmap-id>-<short-description>
```

Quy tắc:

- Viết thường toàn bộ.
- Dùng dấu gạch ngang `-` để ngăn cách từ.
- Giữ tên ngắn gọn nhưng thể hiện đúng phạm vi.
- Không dùng khoảng trắng, dấu tiếng Việt hoặc ký tự đặc biệt.

Các `type` được dùng:

| Type | Khi sử dụng |
|---|---|
| `feat` | Thêm chức năng mới |
| `fix` | Sửa lỗi |
| `docs` | Tài liệu, Swagger, Figma hoặc nội dung không thay đổi logic chạy |
| `refactor` | Cải tổ code nhưng không đổi hành vi |
| `test` | Thêm hoặc sửa test |
| `chore` | Việc bảo trì, seed data, script hỗ trợ |
| `build` | Build system, dependency, Docker |
| `ci` | GitHub Actions hoặc CI/CD |

Ví dụ:

```text
feat/be-02-authentication-api
feat/be-05-ticket-booking-api
feat/fe-06-ticket-booking-ui
build/db-01-sql-server-docker
docs/f-03-login-screen
fix/be-05-prevent-overselling-seats
```

## 5. Đặt tên commit

Dùng [Conventional Commits](https://www.conventionalcommits.org/) với format:

```text
<type>(<scope>): <short-description>
```

Quy tắc:

- Dùng các `type` giống phần đặt tên branch.
- `scope` là module bị ảnh hưởng, ví dụ: `auth`, `flight`, `ticket`, `payment`, `checkin`, `report`, `frontend`, `database`, `docker`, `docs`.
- Phần mô tả viết thường, ngắn gọn, ở thể mệnh lệnh và không kết thúc bằng dấu chấm.
- Một commit nên đại diện cho một thay đổi logic rõ ràng.
- Commit local có thể dùng footer `Refs #<issue-number>`. Việc tự động đóng issue để PR xử lý bằng `Closes #<issue-number>`.

Ví dụ:

```text
feat(auth): add jwt login endpoint
fix(ticket): prevent booking when no seats remain
build(docker): add sql server healthcheck
docs(workflow): add pull request guidelines
test(flight): add flight search integration tests
```

Nếu có breaking change, thêm footer:

```text
BREAKING CHANGE: rename flight status response field to status
```

## 6. Tạo pull request

Trước khi tạo PR:

1. Cập nhật branch với `main`.
2. Chạy test, build hoặc demo thủ công phù hợp với phạm vi thay đổi.
3. Kiểm tra không có secret, file tạm hoặc thay đổi ngoài phạm vi.
4. Push branch và mở PR vào `main`.
5. Điền đầy đủ template PR.

Tên PR dùng cùng convention với commit, thêm mã roadmap ở cuối:

```text
<type>(<scope>): <short-description> [<roadmap-id>]
```

Ví dụ:

```text
feat(auth): add jwt login endpoint [BE-02]
feat(frontend): add ticket booking wizard [FE-06]
build(docker): add sql server container [DB-01]
docs(figma): add login screen design [F-03]
```

## 7. Liên kết PR với issue

Trong phần **Issue** của PR:

```text
Closes #12
```

Khi PR hoàn thành nhiều GitHub issue độc lập, viết mỗi issue trên một dòng:

```text
Closes #12
Closes #18
```

Chỉ dùng `Closes` khi merge PR là đủ để hoàn thành issue. Nếu PR chỉ liên quan hoặc xử lý một phần issue, dùng:

```text
Refs #12
```

## 8. Nội dung PR bắt buộc

Mỗi PR cần nêu rõ:

- GitHub issue và mã roadmap tương ứng.
- Branch đang dùng.
- Danh sách file thêm mới hoặc chỉnh sửa.
- Những thay đổi chính.
- API, database contract hoặc cấu hình mà thành viên khác cần biết.
- Breaking change nếu có.
- Cách đã test hoặc demo.
- Ghi chú phối hợp nếu PR phụ thuộc hoặc ảnh hưởng công việc khác.

Template mặc định nằm tại `.github/pull_request_template.md`.
