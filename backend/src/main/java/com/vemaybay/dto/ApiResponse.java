package com.vemaybay.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final String status;
    private final int code;
    private final String message;
    private final T data;
    private final PaginationInfo pagination;
    private final List<FieldError> errors;
    private final LocalDateTime timestamp;
    private final String requestId;

    @Getter
    @Builder
    public static class FieldError {
        private final String field;
        private final String message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(200)
                .message("Thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(201)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static <T> ApiResponse<T> successWithPagination(T data, PaginationInfo pagination) {
        return ApiResponse.<T>builder()
                .status("success")
                .code(200)
                .message("Thành công")
                .data(data)
                .pagination(pagination)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message, List<FieldError> errors) {
        return ApiResponse.<T>builder()
                .status("error")
                .code(code)
                .message(message)
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .requestId(UUID.randomUUID().toString())
                .build();
    }
}
