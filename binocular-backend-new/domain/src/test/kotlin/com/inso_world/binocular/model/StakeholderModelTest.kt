package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.uuid.Uuid

/**
 * BDD tests for Stakeholder abstract base class.
 * Stakeholder represents any person involved in a project (developer, reviewer, etc.)
 */
class StakeholderModelTest {
    @Nested
    inner class Construction {
        @Test
        fun `given valid name and email, when creating a stakeholder subclass, then it should be created successfully`() {
            // Given
            val name = "John Doe"
            val email = "john@example.com"

            // When - using a concrete test subclass
            val stakeholder = TestStakeholder(name = name, email = email)

            // Then
            assertThat(stakeholder.name).isEqualTo(name)
            assertThat(stakeholder.email).isEqualTo(email)
            assertThat(stakeholder.iid).isNotNull()
        }

        @Test
        fun `given a stakeholder, when accessing uniqueKey, then it should return the expected key`() {
            // Given
            val stakeholder = TestStakeholder(name = "Jane Doe", email = "jane@example.com")

            // When
            val key = stakeholder.uniqueKey

            // Then
            assertThat(key).isNotNull()
        }
    }

    @Nested
    inner class Equality {
        @Test
        fun `given two stakeholders with same iid and uniqueKey, when comparing, then they should be equal`() {
            // Given
            val stakeholder1 = TestStakeholder(name = "Test", email = "test@example.com")
            val stakeholder2 = stakeholder1 // same reference

            // Then
            assertThat(stakeholder1).isEqualTo(stakeholder2)
        }

        @Test
        fun `given two different stakeholders, when comparing, then they should not be equal`() {
            // Given
            val stakeholder1 = TestStakeholder(name = "Test1", email = "test1@example.com")
            val stakeholder2 = TestStakeholder(name = "Test2", email = "test2@example.com")

            // Then
            assertThat(stakeholder1).isNotEqualTo(stakeholder2)
        }
    }

    /**
     * Concrete test implementation of Stakeholder for testing purposes.
     */
    private class TestStakeholder(
        override val name: String,
        override val email: String,
    ) : Stakeholder<TestStakeholder.Id, TestStakeholder.Key>(Id(Uuid.random())) {
        @JvmInline
        value class Id(
            val value: Uuid,
        )

        data class Key(
            val email: String,
        )

        override val uniqueKey: Key
            get() = Key(email)

        override fun equals(other: Any?) = super.equals(other)

        override fun hashCode(): Int = super.hashCode()
    }
}
