package com.inso_world.binocular.web.util

import com.inso_world.binocular.web.exception.ValidationException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import com.inso_world.binocular.web.graphql.model.Sort as ApiSort
import org.springframework.data.domain.Sort as SpringSort

/**
 * Utility class for pagination operations.
 */
object PaginationUtils {
    // Default pagination values hardcoded
    private const val DEFAULT_PAGE = 1
    private const val DEFAULT_SIZE = 20
    private const val MAX_SIZE = 1_000

    // Maximum reasonable page number to prevent performance issues
    private const val MAX_REASONABLE_PAGE = 10_000

    /**
     * Validates pagination parameters and creates a Pageable object.
     * This method combines validation and Pageable creation in one step.
     *
     * @param page The page number (1-based). If null, the default page (1) is used.
     * @param size The number of items per page. If null, the default size (20) is used.
     * @throws ValidationException if the parameters are invalid
     * @return A Pageable object configured with the validated page and size values.
     */
    fun createPageableWithValidation(
        page: Int?,
        size: Int?,
    ): Pageable {
        // Validate input parameters
        if (page != null) {
            when {
                // Check for Integer.MAX_VALUE first to prevent overflow
                page == Integer.MAX_VALUE -> {
                    throw ValidationException(
                        "Page number is at the maximum integer value, which may cause overflow issues.",
                        mapOf(
                            "parameter" to "page",
                            "providedValue" to page,
                        ),
                    )
                }
                page < 1 -> {
                    throw ValidationException(
                        "Page must be greater than or equal to 1",
                        mapOf(
                            "parameter" to "page",
                            "providedValue" to page,
                            "minimumValue" to 1,
                        ),
                    )
                }
                page > MAX_REASONABLE_PAGE -> {
                    throw ValidationException(
                        "Page number is too large. Maximum allowed is $MAX_REASONABLE_PAGE to prevent performance issues.",
                        mapOf(
                            "parameter" to "page",
                            "providedValue" to page,
                            "maximumValue" to MAX_REASONABLE_PAGE,
                        ),
                    )
                }
            }
        }

        if (size != null) {
            when {
                size < 1 -> {
                    throw ValidationException(
                        "PerPage must be greater than or equal to 1",
                        mapOf(
                            "parameter" to "perPage",
                            "providedValue" to size,
                            "minimumValue" to 1,
                        ),
                    )
                }
                size > MAX_SIZE -> {
                    throw ValidationException(
                        "PerPage is too large. Maximum allowed is $MAX_SIZE to prevent excessive resource usage.",
                        mapOf(
                            "parameter" to "perPage",
                            "providedValue" to size,
                            "maximumValue" to MAX_SIZE,
                        ),
                    )
                }
            }
        }

        // Create pageable
        val pageable = createPageable(page, size)

        // Additional validation of the created Pageable object
        validatePageable(pageable)

        return pageable
    }

    /**
     * Overload that accepts API layer Sort enum and maps it to Spring's Direction.
     * The controller is responsible only for providing the default when null (e.g., sort ?: Sort.ASC).
     */
    fun createPageableWithValidation(
        page: Int?,
        size: Int?,
        sort: ApiSort?,
        sortBy: String?,
    ): Pageable {
        val direction: SpringSort.Direction? =
            when (sort) {
                ApiSort.ASC -> SpringSort.Direction.ASC
                ApiSort.DESC -> SpringSort.Direction.DESC
                null -> SpringSort.Direction.ASC
            }
        val base = createPageableWithValidation(page, size)
        return if (direction != null && !sortBy.isNullOrBlank()) {
            PageRequest.of(base.pageNumber, base.pageSize, SpringSort.by(direction, sortBy))
        } else {
            base
        }
    }

    /**
     * Validates a Pageable object to ensure it has valid pagination parameters.
     *
     * @param pageable The Pageable object to validate
     * @throws ValidationException if the Pageable has invalid parameters
     */
    private fun validatePageable(pageable: Pageable) {
        // Check page number (Spring's Pageable is 0-based)
        val pageNumber = pageable.pageNumber
        when {
            pageNumber < 0 -> {
                throw ValidationException(
                    "Page number must be greater than or equal to 0 (internal 0-based indexing)",
                    mapOf(
                        "parameter" to "page",
                        "providedValue" to pageNumber,
                        "minimumValue" to 0,
                    ),
                )
            }
            // Convert to 1-based for consistency with the API
            pageNumber + 1 > MAX_REASONABLE_PAGE -> {
                throw ValidationException(
                    "Page number is too large. Maximum allowed is $MAX_REASONABLE_PAGE to prevent performance issues.",
                    mapOf(
                        "parameter" to "page",
                        "providedValue" to (pageNumber + 1),
                        "maximumValue" to MAX_REASONABLE_PAGE,
                    ),
                )
            }
            pageNumber == Integer.MAX_VALUE - 1 -> {
                throw ValidationException(
                    "Page number is at the maximum integer value, which may cause overflow issues.",
                    mapOf(
                        "parameter" to "page",
                        "providedValue" to (pageNumber + 1),
                    ),
                )
            }
        }

        // Check page size
        val pageSize = pageable.pageSize
        when {
            pageSize < 1 -> {
                throw ValidationException(
                    "PerPage must be greater than or equal to 1",
                    mapOf(
                        "parameter" to "perPage",
                        "providedValue" to pageSize,
                        "minimumValue" to 1,
                    ),
                )
            }
            pageSize > MAX_SIZE -> {
                throw ValidationException(
                    "PerPage is too large. Maximum allowed is $MAX_SIZE to prevent excessive resource usage.",
                    mapOf(
                        "parameter" to "perPage",
                        "providedValue" to pageSize,
                        "maximumValue" to MAX_SIZE,
                    ),
                )
            }
        }
    }

    /**
     * Creates a Pageable object for pagination based on the provided parameters.
     *
     * @param page The page number (1-based). If null, the default page (1) is used.
     * @param size The number of items per page. If null, the default size (20) is used.
     * @return A Pageable object configured with the validated page and size values.
     */
    private fun createPageable(
        page: Int?,
        size: Int?,
    ): Pageable {
        // Ensure page is between 1 and MAX_REASONABLE_PAGE
        val validPage = (page ?: DEFAULT_PAGE).coerceIn(1, MAX_REASONABLE_PAGE)

        // Ensure size is between 1 and MAX_SIZE
        val validSize = (size ?: DEFAULT_SIZE).coerceIn(1, MAX_SIZE)

        // Convert from 1-based (API) to 0-based (Spring)
        return PageRequest.of(validPage - 1, validSize)
    }
}
