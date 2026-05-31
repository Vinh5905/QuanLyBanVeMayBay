package com.vemaybay.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaginationInfo {

    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
}
