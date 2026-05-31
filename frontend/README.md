# Frontend

Thư mục dành cho ReactJS web frontend.

## Stack dự kiến

- ReactJS + TypeScript
- Vite
- React Router
- Axios hoặc HTTP client tương đương
- TanStack Query hoặc state-query layer tương đương
- React Hook Form + schema validation

## Biến môi trường

Frontend đọc API URL từ biến môi trường:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Không hardcode URL backend trong component.

## Cấu trúc dự kiến

```text
frontend/src/
├── api/          # HTTP client, endpoint modules, response adapters
├── app/          # Router, providers, app bootstrap
├── components/   # Shared UI components
├── features/     # Feature modules theo nghiệp vụ
├── hooks/        # Shared hooks
├── layouts/      # App shell, sidebar, header
├── pages/        # Route-level pages
├── types/        # Shared TypeScript types
└── utils/        # Helper functions
```

Roadmap triển khai nằm trong `project_roadmap_github_issues.md`, nhóm issue `FE-01` đến `FE-10`.
