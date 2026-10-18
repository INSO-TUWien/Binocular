package com.inso_world.binocular.web.graphql.model

import com.inso_world.binocular.core.persistence.model.Page
import org.springframework.data.domain.Pageable

/**
 * Generic pagination response wrapper for GraphQL queries.
 * This class wraps a collection of items with pagination metadata.
 *
 * @param T The type of items in the page
 * @property count The total number of items across all pages
 * @property page The current page number (1-based)
 * @property perPage The number of items per page
 * @property data The actual items in the current page
 */
data class PageDto<T>(
    val count: Int,
    val page: Int,
    val perPage: Int,
    val data: List<T>,
) {
    /**
     * Secondary constructor that automatically converts from Spring's 0-based pagination to 1-based pagination.
     *
     * @param count The total number of items across all pages
     * @param pageable The Spring Pageable object (0-based)
     * @param data The actual items in the current page
     */
    constructor(count: Int, pageable: Pageable, data: List<T>) : this(
        count = count,
        page = pageable.pageNumber + 1, // Convert from 0-based to 1-based
        perPage = pageable.pageSize,
        data = data,
    )

    /**
     * Secondary constructor that takes a Page object directly.
     * Automatically converts from 0-based pagination to 1-based pagination.
     *
     * @param page The Page object
     */
    constructor(page: Page<T>) : this(
        count = page.totalElements.toInt(),
        page = page.number + 1, // Convert from 0-based to 1-based
        perPage = page.size,
        data = page.content,
    )

    fun <R> map(mapper: (T) -> R): PageDto<R> =
        PageDto(
            count = count,
            page = page,
            perPage = perPage,
            data = data.map(mapper)
        )
}
