package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import java.time.LocalDateTime

class CommitSignatureModelTest {
    private lateinit var repository: Repository
    private lateinit var author: Developer
    private lateinit var committer: Developer

    @BeforeEach
    fun setUp() {
        val project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid)
        author = Developer(name = "Author Name", email = "author@example.com", repositoryId = repository.iid)
        committer = Developer(name = "Committer Name", email = "committer@example.com", repositoryId = repository.iid)
    }

    @Nested
    inner class AuthorSignature {
        @Test
        fun `given valid authorSignature, when creating commit, then author should be set`() {
            // Given
            val authorTimestamp = LocalDateTime.now().minusSeconds(10)
            val authorSignature = Signature(developerId = author.iid, timestamp = authorTimestamp)

            // When
            val commit =
                Commit(
                    sha = "a".repeat(40),
                    authorSignature = authorSignature,
                    repositoryId = repository.iid,
                )

            // Then
            assertAll(
                { assertThat(commit.authorSignature).isEqualTo(authorSignature) },
                { assertThat(commit.authorSignature.developerId).isEqualTo(author.iid) },
                { assertThat(commit.authorSignature.timestamp).isEqualTo(authorTimestamp) },
            )
        }

        @Test
        fun `given commit with authorSignature, when authorId is accessed, then it should return the developerId`() {
            // Given
            val authorSignature = Signature(developerId = author.iid, timestamp = LocalDateTime.now().minusSeconds(1))
            val commit =
                Commit(
                    sha = "b".repeat(40),
                    authorSignature = authorSignature,
                    repositoryId = repository.iid,
                )

            // When
            val commitAuthorId = commit.authorSignature.developerId

            // Then
            assertThat(commitAuthorId).isEqualTo(author.iid)
        }
    }

    @Nested
    inner class CommitterSignature {
        @Test
        fun `given no committerSignature, when creating commit, then committer should default to author`() {
            // Given
            val authorSignature = Signature(developerId = author.iid, timestamp = LocalDateTime.now().minusSeconds(1))

            // When
            val commit =
                Commit(
                    sha = "d".repeat(40),
                    authorSignature = authorSignature,
                    repositoryId = repository.iid,
                )

            // Then
            assertAll(
                { assertThat(commit.committerSignature).isEqualTo(authorSignature) },
                { assertThat(commit.committerSignature.developerId).isEqualTo(author.iid) },
            )
        }

        @Test
        fun `given explicit committerSignature, when creating commit, then committer should be different from author`() {
            // Given
            val authorTimestamp = LocalDateTime.now().minusSeconds(10)
            val committerTimestamp = LocalDateTime.now().minusSeconds(5)
            val authorSignature = Signature(developerId = author.iid, timestamp = authorTimestamp)
            val committerSignature = Signature(developerId = committer.iid, timestamp = committerTimestamp)

            // When
            val commit =
                Commit(
                    sha = "e".repeat(40),
                    authorSignature = authorSignature,
                    committerSignature = committerSignature,
                    repositoryId = repository.iid,
                )

            // Then
            assertAll(
                { assertThat(commit.authorSignature).isEqualTo(authorSignature) },
                { assertThat(commit.committerSignature).isEqualTo(committerSignature) },
                { assertThat(commit.authorSignature.developerId).isEqualTo(author.iid) },
                { assertThat(commit.committerSignature.developerId).isEqualTo(committer.iid) },
                { assertThat(commit.authorSignature.developerId).isNotEqualTo(commit.committerSignature.developerId) },
            )
        }
    }

    @Nested
    inner class CommitDateTime {
        @Test
        fun `given commit with explicit committerSignature, when accessing commitDateTime, then it should use committerSignature timestamp`() {
            // Given
            val committerTimestamp = LocalDateTime.now().minusSeconds(5)
            val authorSignature = Signature(developerId = author.iid, timestamp = LocalDateTime.now().minusSeconds(10))
            val committerSignature = Signature(developerId = committer.iid, timestamp = committerTimestamp)

            // When
            val commit =
                Commit(
                    sha = "4".repeat(40),
                    authorSignature = authorSignature,
                    committerSignature = committerSignature,
                    repositoryId = repository.iid,
                )

            // Then
            assertThat(commit.commitDateTime).isEqualTo(committerTimestamp)
        }

        @Test
        fun `given commit without committerSignature, when accessing commitDateTime, then it should use authorSignature timestamp`() {
            // Given
            val authorTimestamp = LocalDateTime.now().minusSeconds(5)
            val authorSignature = Signature(developerId = author.iid, timestamp = authorTimestamp)

            // When
            val commit =
                Commit(
                    sha = "5".repeat(40),
                    authorSignature = authorSignature,
                    repositoryId = repository.iid,
                )

            // Then
            assertThat(commit.commitDateTime).isEqualTo(authorTimestamp)
        }
    }
}
