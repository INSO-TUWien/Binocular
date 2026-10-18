package com.inso_world.binocular.web.graphql.error

import com.inso_world.binocular.web.exception.NotFoundException
import com.inso_world.binocular.web.exception.ValidationException
import com.inso_world.binocular.web.util.PaginationUtils
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class GraphQLValidationUtilsTest {
    @Test
    fun `createPageableWithValidation should not throw exception for valid parameters`() {
        // Valid parameters
        PaginationUtils.createPageableWithValidation(1, 10)
        PaginationUtils.createPageableWithValidation(100, 50)

        // Null parameters (should use defaults)
        PaginationUtils.createPageableWithValidation(null, null)
        PaginationUtils.createPageableWithValidation(1, null)
        PaginationUtils.createPageableWithValidation(null, 10)
    }

    @Test
    fun `createPageableWithValidation should throw exception for invalid page parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(0, 10)
            }

        assert(exception.message?.contains("Page must be greater than or equal to 1") == true)
        assert(exception.extensions["parameter"] == "page")
        assert(exception.extensions["providedValue"] == 0)
        assert(exception.extensions["minimumValue"] == 1)
    }

    @Test
    fun `createPageableWithValidation should throw exception for invalid perPage parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(1, 0)
            }

        assert(exception.message?.contains("PerPage must be greater than or equal to 1") == true)
        assert(exception.extensions["parameter"] == "perPage")
        assert(exception.extensions["providedValue"] == 0)
        assert(exception.extensions["minimumValue"] == 1)
    }

    @Test
    fun `createPageableWithValidation should throw exception for negative page parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(-5, 10)
            }

        assert(exception.message?.contains("Page must be greater than or equal to 1") == true)
        assert(exception.extensions["parameter"] == "page")
        assert(exception.extensions["providedValue"] == -5)
        assert(exception.extensions["minimumValue"] == 1)
    }

    @Test
    fun `createPageableWithValidation should throw exception for negative perPage parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(1, -5)
            }

        assert(exception.message?.contains("PerPage must be greater than or equal to 1") == true)
        assert(exception.extensions["parameter"] == "perPage")
        assert(exception.extensions["providedValue"] == -5)
        assert(exception.extensions["minimumValue"] == 1)
    }

    @Test
    fun `createPageableWithValidation should throw exception for extremely large page parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(20000, 10)
            }

        assert(exception.message?.contains("Page number is too large") == true)
        assert(exception.extensions["parameter"] == "page")
        assert(exception.extensions["providedValue"] == 20000)
        assert(exception.extensions["maximumValue"] == 10000)
    }

    @Test
    fun `createPageableWithValidation should throw exception for extremely large perPage parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(1, 2000)
            }

        assert(exception.message?.contains("PerPage is too large") == true)
        assert(exception.extensions["parameter"] == "perPage")
        assert(exception.extensions["providedValue"] == 2000)
        assert(exception.extensions["maximumValue"] == 1000)
    }

    @Test
    fun `createPageableWithValidation should throw exception for Integer MAX_VALUE page parameter`() {
        val exception =
            assertThrows<ValidationException> {
                PaginationUtils.createPageableWithValidation(Integer.MAX_VALUE, 10)
            }

        assert(exception.message?.contains("maximum integer value") == true)
        assert(exception.extensions["parameter"] == "page")
        assert(exception.extensions["providedValue"] == Integer.MAX_VALUE)
    }

    @Test
    fun `requireEntityExists should return entity if it exists`() {
        val entity = "Test Entity"
        val result = GraphQLValidationUtils.requireEntityExists(entity, "TestEntity", "1")

        assert(result == entity)
    }

    @Test
    fun `requireEntityExists should throw exception if entity is null`() {
        val exception =
            assertThrows<NotFoundException> {
                GraphQLValidationUtils.requireEntityExists(null, "TestEntity", "1")
            }

        assert(exception.message?.contains("TestEntity not found with id: 1") == true)
    }
}
