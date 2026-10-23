package com.inso_world.binocular.model

import com.inso_world.binocular.domain.data.MockTestDataProvider
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.time.LocalDateTime
import kotlin.uuid.Uuid

class CommitModelTest {
    private lateinit var repository: Repository
    private lateinit var mockTestDataProvider: MockTestDataProvider

    @BeforeEach
    fun setUp() {
        val project = Project(name = "test-project")
        repository =
            Repository(
                localPath = "test",
                projectId = project.iid,
            )
        mockTestDataProvider = MockTestDataProvider(repository)
    }

    private fun createDeveloper(
        name: String = "Test Developer",
        email: String = "dev@test.com",
    ) = Developer(name = name, email = email, repositoryId = repository.iid)

    private fun createSignature(
        developer: Developer,
        timestamp: LocalDateTime = LocalDateTime.now().minusSeconds(1),
    ) = Signature(developerId = developer.iid, timestamp = timestamp)

    @Test
    fun `create commit, check that iid is created automatically`() {
        val developer = createDeveloper()
        val signature = createSignature(developer)
        val commit =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )

        assertThat(commit.iid).isNotNull()
    }

    @Test
    fun `create commit, check that hashCode is based on iid`() {
        val developer = createDeveloper()
        val signature = createSignature(developer)
        val commit =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )

        assertThat(commit.hashCode()).isEqualTo(commit.iid.hashCode())
    }

    @Test
    fun `create commit, validate uniqueKey`() {
        val developer = createDeveloper()
        val signature = createSignature(developer)
        val commit =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )

        assertAll(
            { assertThat(commit.uniqueKey).isEqualTo(Commit.Key("a".repeat(40))) },
            { assertThat(commit.uniqueKey.sha).isEqualTo(commit.sha) },
        )
    }

    @Test
    fun `create commit, validate repository relation`() {
        val project = Project(name = "test-2")
        val repository =
            Repository(
                localPath = "test-2",
                projectId = project.iid,
            )
        val developer = Developer(name = "Test", email = "test@example.com", repositoryId = repository.iid)
        val signature = createSignature(developer)
        val commit =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )

        assertThat(commit.repositoryId).isEqualTo(repository.iid)
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideInvalidPastOrPresentDateTime")
    fun `create commit, invalid timestamp in signature`(timestamp: LocalDateTime) {
        val developer = createDeveloper()
        assertThrows<IllegalArgumentException> {
            Signature(developerId = developer.iid, timestamp = timestamp)
        }
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideAllowedPastOrPresentDateTime")
    fun `create commit, valid timestamp in signature`(timestamp: LocalDateTime) {
        val developer = createDeveloper()
        assertDoesNotThrow {
            val signature = Signature(developerId = developer.iid, timestamp = timestamp)
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )
        }
    }

    @Test
    fun `create two commits, same sha, should not be equal`() {
        val developer = createDeveloper()
        val signature = createSignature(developer)
        val commitA =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )
        val commitB =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )

        assertAll(
            { assertThat(commitA.iid).isNotEqualTo(commitB.iid) },
            { assertThat(commitA.uniqueKey).isEqualTo(commitB.uniqueKey) },
            { assertThat(commitA).isNotEqualTo(commitB) },
        )
    }

    @Test
    fun `create commit, then copy, should not be equal`() {
        val developer = createDeveloper()
        val signature = createSignature(developer)
        val commitA =
            Commit(
                sha = "a".repeat(40),
                message = "msg1",
                authorSignature = signature,
                repositoryId = repository.iid,
            )
        val commitB = commitA.copy(iid = Commit.Id(Uuid.random()))

        assertAll(
            { assertThat(commitA.iid).isNotEqualTo(commitB.iid) },
            { assertThat(commitA.uniqueKey).isEqualTo(commitB.uniqueKey) },
            { assertThat(commitA).isNotEqualTo(commitB) },
        )
    }

    @Nested
    inner class AuthorAndCommitterValidation {
        @BeforeEach
        fun setUp() {
            this@CommitModelTest.setUp()
        }

        @Test
        fun `create commit with authorSignature only, author and committer should be same`() {
            val developer = createDeveloper()
            val signature = createSignature(developer)

            val commit =
                Commit(
                    sha = "a".repeat(40),
                    message = "msg1",
                    authorSignature = signature,
                    repositoryId = repository.iid,
                )

            assertAll(
                { assertThat(commit.authorSignature.developerId).isEqualTo(developer.iid) },
                { assertThat(commit.committerSignature.developerId).isEqualTo(developer.iid) },
            )
        }

        @Test
        fun `create commit with separate committerSignature, should have different author and committer`() {
            val author = createDeveloper(name = "Author", email = "author@test.com")
            val committer = createDeveloper(name = "Committer", email = "committer@test.com")
            val authorSig = createSignature(author)
            val committerSig = createSignature(committer)

            val commit =
                Commit(
                    sha = "a".repeat(40),
                    message = "msg1",
                    authorSignature = authorSig,
                    committerSignature = committerSig,
                    repositoryId = repository.iid,
                )

            assertAll(
                { assertThat(commit.authorSignature.developerId).isEqualTo(author.iid) },
                { assertThat(commit.committerSignature.developerId).isEqualTo(committer.iid) },
                { assertThat(commit.authorSignature.developerId).isNotEqualTo(commit.committerSignature.developerId) },
            )
        }

        @Test
        fun `commit timestamps come from signatures`() {
            val author = createDeveloper(name = "Author", email = "author@test.com")
            val committer = createDeveloper(name = "Committer", email = "committer@test.com")
            val authorTime = LocalDateTime.of(2024, 1, 1, 10, 0)
            val committerTime = LocalDateTime.of(2024, 1, 1, 11, 0)
            val authorSig = Signature(developerId = author.iid, timestamp = authorTime)
            val committerSig = Signature(developerId = committer.iid, timestamp = committerTime)

            val commit =
                Commit(
                    sha = "a".repeat(40),
                    message = "msg1",
                    authorSignature = authorSig,
                    committerSignature = committerSig,
                    repositoryId = repository.iid,
                )

            assertAll(
                { assertThat(commit.authorDateTime).isEqualTo(authorTime) },
                { assertThat(commit.commitDateTime).isEqualTo(committerTime) },
            )
        }
    }

    @Nested
    inner class ParentsRelation {
        @BeforeEach
        fun setUp() {
            this@CommitModelTest.setUp()
        }

        @Test
        fun `create commit, add parent, should succeed`() {
            val commit = mockTestDataProvider.commitBySha.getValue("a".repeat(40))
            val parent = mockTestDataProvider.commitBySha.getValue("b".repeat(40))

            assertTrue(commit.parentShas.add(parent.sha))

            assertAll(
                "parent relation",
                { assertThat(commit.parentShas).hasSize(1) },
                { assertThat(commit.parentShas).containsOnly(parent.sha) },
            )
        }

        @Test
        fun `create commit, add same parent twice, should only be added once`() {
            val commit = mockTestDataProvider.commitBySha.getValue("a".repeat(40))
            val parent = mockTestDataProvider.commitBySha.getValue("b".repeat(40))

            assertTrue(commit.parentShas.add(parent.sha))
            assertFalse(commit.parentShas.add(parent.sha))
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `create commit, add same commit to parents, should fail`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `create commit, add same commit to children, should fail`() {
        }
    }
}
