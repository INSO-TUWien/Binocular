package com.inso_world.binocular.web.graphql.integration.realdata.assertions

import org.junit.jupiter.api.Assertions.assertTrue

/**
 * Helper utilities to compare ISO-8601 instant strings without parsing.
 *
 * Typical API responses can return instants with or without millisecond precision
 * (e.g. "2024-08-08T06:55:09Z" vs "2024-08-08T06:55:09.000Z"). These helpers
 * normalize such strings by stripping any trailing fractional seconds that are
 * all zeros before doing a plain string comparison. No date parsing is used.
 */
object DateAssertions {
    /**
     * Returns a normalized representation suitable for string comparison.
     * Rules:
     * - If the string ends with fractional seconds that are all zeros before the trailing 'Z',
     *   these fractional seconds are removed (e.g. ".0Z", ".00Z", ".000Z" -> "Z").
     * - The function is null-safe; null is returned as-is to allow explicit assertions if needed.
     */
    fun normalizeIsoInstant(value: String?): String? {
        if (value == null) return null
        // Replace .0...0Z with Z (any number of zeros)
        return value.replace(Regex("\\.0+Z$"), "Z")
    }

    /**
     * Checks if two ISO-8601 instant strings are equivalent after normalization.
     * No date parsing is performed.
     */
    fun isoInstantEquals(
        a: String?,
        b: String?
    ): Boolean = normalizeIsoInstant(a) == normalizeIsoInstant(b)

    /**
     * Assert that the actual ISO-8601 instant equals the expected one after normalization.
     * Example:
     *   assertIsoInstantEquals(createdAt, "2024-08-08T06:55:09Z", "issue.createdAt")
     */
    fun assertIsoInstantEquals(
        actual: String?,
        expected: String,
        message: String? = null
    ) {
        val result = isoInstantEquals(actual, expected)
        val defaultMsg = "Expected $expected but was $actual (normalized: ${normalizeIsoInstant(actual)})"
        assertTrue(result, message ?: defaultMsg)
    }

    /**
     * Assert that the actual ISO-8601 instant equals any of the provided expected values
     * after normalization.
     * Example (one-liner replacement for manual OR checks):
     *   assertIsoInstantEqualsAny(createdAt, "2024-08-08T06:55:09Z", "2024-08-08T06:55:09.000Z", message = "issue.createdAt")
     */
    fun assertIsoInstantEqualsAny(
        actual: String?,
        vararg expected: String,
        message: String? = null
    ) {
        val normActual = normalizeIsoInstant(actual)
        val anyMatch = expected.any { normalizeIsoInstant(it) == normActual }
        val defaultMsg = "Expected one of ${expected.toList()} but was $actual (normalized: $normActual)"
        assertTrue(anyMatch, message ?: defaultMsg)
    }
}
