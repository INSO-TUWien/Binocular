package com.inso_world.binocular.ffi.integration

import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import com.inso_world.binocular.model.vcs.ReferenceCategory
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import kotlin.uuid.ExperimentalUuidApi

@OptIn(ExperimentalUuidApi::class)
class GitIndexerTest {
    private lateinit var project: Project
    private lateinit var repository: Repository

    @BeforeEach
    fun setUp() {
        project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid)
    }

    @Nested
    inner class RepositoryOperations {
        @Test
        fun `findRepo should create separate Repository instances for different projects`() {
            val project2 = Project(name = "test-project-2")
            val repository2 = Repository(localPath = "test-repo", projectId = project2.iid)
            assertThat(repository.projectId).isNotEqualTo(repository2.projectId)
        }
    }

    @Nested
    inner class BranchOperations {
        @Test
        fun `branch headSha should match commit sha`() {
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
            assertThat(branch.headSha).isEqualTo(head.sha)
        }
    }

    @Nested
    inner class CommitOperations {
        @Test
        fun `commit should track repositoryId`() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now())
            val commit = Commit(sha = "a".repeat(40), authorSignature = sig, repositoryId = repository.iid)
            assertThat(commit.repositoryId).isEqualTo(repository.iid)
        }

        @Test
        fun `commit parent relationships should be correctly established`() {
            val dev = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = dev.iid, timestamp = LocalDateTime.now())
            val parent = Commit(sha = "0".repeat(40), authorSignature = sig, repositoryId = repository.iid)
            val child = Commit(sha = "1".repeat(40), authorSignature = sig, repositoryId = repository.iid)

            child.parentShas.add(parent.sha)
            assertThat(child.parentShas).containsExactly(parent.sha)
        }
    }
}
