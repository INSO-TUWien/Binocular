package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource

/**
 * BDD tests for Developer domain model.
 * Developer represents a git user scoped to a Repository, extending Stakeholder.
 */
class DeveloperModelTest {
    private lateinit var repository: Repository

    private fun developer(name: String = "Test", email: String = "test@example.com"): Developer =
        Developer(name = name, email = email, repositoryId = repository.iid)

    @BeforeEach
    fun setUp() {
        val project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid)
    }

    @Nested
    inner class Construction {
        @Test
        fun `given valid name and email, when creating developer, then it should be created with iid`() {
            // Given
            val name = "John Doe"
            val email = "john@example.com"

            // When
            val developer = Developer(name = name, email = email, repositoryId = repository.iid)

            // Then
            assertAll(
                { assertThat(developer.name).isEqualTo(name) },
                { assertThat(developer.email).isEqualTo(email) },
                { assertThat(developer.repositoryId).isEqualTo(repository.iid) },
                { assertThat(developer.iid).isNotNull() },
            )
        }

        @Test
        fun `given developer creation, when checking repository id, then it should match`() {
            // Given & When
            val developer = Developer(name = "Jane", email = "jane@example.com", repositoryId = repository.iid)

            // Then
            assertThat(developer.repositoryId).isEqualTo(repository.iid)
        }

        @ParameterizedTest
        @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideBlankStrings")
        fun `given blank name, when creating developer, then it should throw IllegalArgumentException`(name: String) {
            // When & Then
            assertThrows<IllegalArgumentException> {
                Developer(name = name, email = "test@example.com", repositoryId = repository.iid)
            }
        }

        @ParameterizedTest
        @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideBlankStrings")
        fun `given blank email, when creating developer, then it should throw IllegalArgumentException`(email: String) {
            // When & Then
            assertThrows<IllegalArgumentException> {
                Developer(name = "Test", email = email, repositoryId = repository.iid)
            }
        }
    }

    @Nested
    inner class UniqueKey {
        @Test
        fun `given developer, when accessing uniqueKey, then it should contain repositoryId and gitSignature`() {
            // Given
            val developer = developer(name = "Test User")

            // When
            val key = developer.uniqueKey

            // Then
            assertAll(
                { assertThat(key.repositoryId).isEqualTo(repository.iid) },
                { assertThat(key.gitSignature).isEqualTo("Test User <test@example.com>") },
            )
        }
    }

    @Nested
    inner class GitSignature {
        @Test
        fun `given developer with name and email, when getting gitSignature, then it should return formatted signature`() {
            // Given
            val developer = developer(name = "John Doe", email = "john@example.com")

            // When
            val signature = developer.gitSignature

            // Then
            assertThat(signature).isEqualTo("John Doe <john@example.com>")
        }

        @Test
        fun `given developer with whitespace in name, when getting gitSignature, then it should trim the name`() {
            // Given
            val developer = developer(name = "  John Doe  ", email = "john@example.com")

            // When
            val signature = developer.gitSignature

            // Then
            assertThat(signature).isEqualTo("John Doe <john@example.com>")
        }
    }

    @Nested
    inner class Equality {
        @Test
        fun `given same developer instance, when comparing with equals, then it should be equal`() {
            // Given
            val developer = developer()

            // Then
            assertThat(developer).isEqualTo(developer)
        }

        @Test
        fun `given two different developers, when comparing, then they should not be equal`() {
            // Given
            val developer1 = developer(name = "Test1", email = "test1@example.com")
            val developer2 = developer(name = "Test2", email = "test2@example.com")

            // Then
            assertThat(developer1).isNotEqualTo(developer2)
        }

        @Test
        fun `given developer, when getting hashCode, then it should be based on iid`() {
            // Given
            val developer = developer()

            // Then
            assertThat(developer.hashCode()).isEqualTo(developer.iid.hashCode())
        }
    }

    @Nested
    inner class InheritanceFromStakeholder {
        @Test
        fun `given developer, when checking inheritance, then it should be instance of Stakeholder`() {
            // Given
            val developer = developer()

            // Then
            assertThat(developer).isInstanceOf(Stakeholder::class.java)
        }
    }
}
