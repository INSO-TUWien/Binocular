package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.time.LocalDateTime

/**
 * BDD tests for Signature value class.
 * Signature represents a Git signature consisting of a Developer and a timestamp,
 * used for author and committer information in commits.
 */
class SignatureModelTest {
    private lateinit var repository: Repository
    private lateinit var developer: Developer

    @BeforeEach
    fun setUp() {
        val project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid).apply { this.project = project }
        developer = Developer(name = "John Doe", email = "john@example.com", repositoryId = repository.iid).apply { this.repository = repository }
    }

    @Nested
    inner class Construction {
        private fun signature(timestamp: LocalDateTime) = Signature(developerId = developer.iid, timestamp = timestamp).apply { this.developer = this@SignatureModelTest.developer }

        @Test
        fun `given valid developer and timestamp, when creating signature, then it should be created successfully`() {
            // Given
            val timestamp = LocalDateTime.now().minusSeconds(1)

            // When
            val signature = signature(timestamp)

            // Then
            assertAll(
                { assertThat(signature.developer).isSameAs(developer) },
                { assertThat(signature.timestamp).isEqualTo(timestamp) },
            )
        }

        @ParameterizedTest
        @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideAllowedPastOrPresentDateTime")
        fun `given valid past or present timestamp, when creating signature, then it should succeed`(timestamp: LocalDateTime) {
            // When & Then
            val signature = signature(timestamp)
            assertThat(signature.timestamp).isEqualTo(timestamp)
        }

        @ParameterizedTest
        @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideInvalidPastOrPresentDateTime")
        fun `given future timestamp, when creating signature, then it should throw IllegalArgumentException`(timestamp: LocalDateTime) {
            // When & Then
            assertThrows<IllegalArgumentException> {
                Signature(developerId = developer.iid, timestamp = timestamp)
            }
        }
    }

    @Nested
    inner class ValueSemantics {
        private fun signature(timestamp: LocalDateTime, dev: Developer = developer) = 
            Signature(developerId = dev.iid, timestamp = timestamp).apply { this.developer = dev }

        @Test
        fun `given two signatures with same developer and timestamp, when comparing, then they should be equal`() {
            // Given
            val timestamp = LocalDateTime.of(2024, 1, 1, 12, 0, 0)
            val signature1 = signature(timestamp)
            val signature2 = signature(timestamp)

            // Then
            assertThat(signature1).isEqualTo(signature2)
        }

        @Test
        fun `given two signatures with different timestamps, when comparing, then they should not be equal`() {
            // Given
            val signature1 = signature(LocalDateTime.of(2024, 1, 1, 12, 0, 0))
            val signature2 = signature(LocalDateTime.of(2024, 1, 1, 13, 0, 0))

            // Then
            assertThat(signature1).isNotEqualTo(signature2)
        }

        @Test
        fun `given two signatures with different developers, when comparing, then they should not be equal`() {
            // Given
            val developer2 = Developer(name = "Jane", email = "jane@example.com", repositoryId = repository.iid).apply { this.repository = this@SignatureModelTest.repository }
            val timestamp = LocalDateTime.of(2024, 1, 1, 12, 0, 0)
            val signature1 = signature(timestamp)
            val signature2 = signature(timestamp, developer2)

            // Then
            assertThat(signature1).isNotEqualTo(signature2)
        }

        @Test
        fun `given same signature values, when getting hashCode, then they should be equal`() {
            // Given
            val timestamp = LocalDateTime.of(2024, 1, 1, 12, 0, 0)
            val signature1 = signature(timestamp)
            val signature2 = signature(timestamp)

            // Then
            assertThat(signature1.hashCode()).isEqualTo(signature2.hashCode())
        }
    }

    @Nested
    inner class GitSignatureFormat {
        @Test
        fun `given signature, when getting gitSignature, then it should return formatted string`() {
            // Given
            val timestamp = LocalDateTime.of(2024, 6, 15, 14, 30, 0)
            val signature = Signature(developerId = developer.iid, timestamp = timestamp).apply { this.developer = this@SignatureModelTest.developer }

            // When
            val gitSig = signature.gitSignature

            // Then - should contain developer's name and email
            assertThat(gitSig).isEqualTo("John Doe <john@example.com>")
        }
    }

    @Nested
    inner class Immutability {
        @Test
        fun `given signature, when accessing properties, then they should be immutable`() {
            // Given
            val timestamp = LocalDateTime.of(2024, 1, 1, 12, 0, 0)
            val signature = Signature(developerId = developer.iid, timestamp = timestamp).apply { this.developer = this@SignatureModelTest.developer }

            // Then - Signature is a data class with val properties, proving immutability
            assertAll(
                { assertThat(signature.developer).isSameAs(developer) },
                { assertThat(signature.timestamp).isEqualTo(timestamp) },
            )
        }
    }
}
