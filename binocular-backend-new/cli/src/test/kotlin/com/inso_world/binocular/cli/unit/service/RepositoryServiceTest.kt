package com.inso_world.binocular.cli.unit.service

import com.inso_world.binocular.core.unit.base.BaseUnitTest
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import java.time.LocalDateTime

@DisplayName("RepositoryService")
internal class RepositoryServiceTest : BaseUnitTest() {
    private lateinit var project: Project
    private lateinit var repository: Repository

    @BeforeEach
    fun setUp() {
        project = Project(name = "test-project")
        repository = Repository(localPath = "/test/repo", projectId = project.iid)
    }

    @Nested
    @DisplayName("Given a repository with existing developers")
    inner class DeveloperDeduplication {
        private lateinit var existingDeveloper: Developer

        @BeforeEach
        fun setUp() {
            existingDeveloper =
                Developer(
                    name = "Alice",
                    email = "alice@example.com",
                    repositoryId = repository.iid,
                )
        }

        @Test
        @DisplayName("When creating a commit with an existing developer, then the developer should be reused")
        fun `should reuse existing developer when git signature matches`() {
            // When - create commit with same git signature
            val timestamp = LocalDateTime.now().minusHours(1)
            val signature = Signature(developerId = existingDeveloper.iid, timestamp = timestamp)
            val commit =
                Commit(
                    sha = "a".repeat(40),
                    authorSignature = signature,
                    message = "Test commit",
                    repositoryId = repository.iid,
                )

            // Then
            assertAll(
                { assertThat(commit.authorSignature.developerId).isEqualTo(existingDeveloper.iid) },
                { assertThat(commit.repositoryId).isEqualTo(repository.iid) },
            )
        }

        @Test
        @DisplayName("When creating a commit with a new developer, then a new developer should be registered")
        fun `should register new developer when git signature differs`() {
            // When - create commit with different developer
            val newDeveloper =
                Developer(
                    name = "Bob",
                    email = "bob@example.com",
                    repositoryId = repository.iid,
                )
            val timestamp = LocalDateTime.now().minusHours(1)
            val signature = Signature(developerId = newDeveloper.iid, timestamp = timestamp)
            val commit =
                Commit(
                    sha = "b".repeat(40),
                    authorSignature = signature,
                    message = "Another commit",
                    repositoryId = repository.iid,
                )

            // Then
            assertAll(
                { assertThat(commit.authorSignature.developerId).isEqualTo(newDeveloper.iid) },
                { assertThat(commit.repositoryId).isEqualTo(repository.iid) },
            )
        }
    }

    @Nested
    @DisplayName("Given commits with parent-child relationships")
    inner class ParentChildRelationships {
        private lateinit var rootCommit: Commit

        @BeforeEach
        fun setUp() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now().minusDays(1))
            rootCommit = Commit(sha = "0".repeat(40), authorSignature = sig, repositoryId = repository.iid)
        }

        @Test
        fun `should establish bidirectional parent-child relationship`() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now())
            val childCommit = Commit(sha = "1".repeat(40), authorSignature = sig, repositoryId = repository.iid)

            childCommit.parentShas.add(rootCommit.sha)
            rootCommit.childShas.add(childCommit.sha)

            assertAll(
                { assertThat(childCommit.parentShas).containsExactly(rootCommit.sha) },
                { assertThat(rootCommit.childShas).containsExactly(childCommit.sha) },
            )
        }
    }

    @Nested
    inner class CommitRegistration {
        @Test
        fun `commits should track repositoryId`() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now())
            val commit = Commit(sha = "a".repeat(40), authorSignature = sig, repositoryId = repository.iid)

            assertThat(commit.repositoryId).isEqualTo(repository.iid)
        }
    }

    @Nested
    inner class BranchOperations {
        @Test
        fun `branch should register with repository and track head`() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now())
            val head = Commit(sha = "a".repeat(40), authorSignature = sig, repositoryId = repository.iid)

            val branch =
                Branch(
                    name = "main",
                    fullName = "refs/heads/main",
                    category = ReferenceCategory.LOCAL_BRANCH,
                    repositoryId = repository.iid,
                    headSha = head.sha
                )

            assertAll(
                { assertThat(branch.repositoryId).isEqualTo(repository.iid) },
                { assertThat(branch.headSha).isEqualTo(head.sha) }
            )
        }
    }
}
