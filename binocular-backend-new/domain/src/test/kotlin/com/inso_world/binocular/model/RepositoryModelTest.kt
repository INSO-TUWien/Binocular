package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import kotlin.uuid.Uuid

class RepositoryModelTest {
    private lateinit var repository: Repository
    private lateinit var project: Project

    @BeforeEach
    fun setup() {
        project = Project(name = "test-project")
        repository = Repository(localPath = "test-repo", projectId = project.iid)
    }

    @Test
    fun `create empty repository, checks that iid is created automatically`() {
        val repo = Repository(localPath = "another-repo", projectId = project.iid)
        assertThat(repo.iid).isNotNull()
    }

    @Test
    fun `create repository, validate uniqueKey`() {
        val key = repository.uniqueKey
        assertThat(key.projectId).isEqualTo(project.iid)
        assertThat(key.localPath).isEqualTo("test-repo")
    }

    @Test
    fun `create repository, validate hashCode is same based on iid`() {
        val repo = Repository(localPath = "test-repo", projectId = project.iid)
        assertThat(repo.hashCode()).isEqualTo(repo.iid.hashCode())
    }

    @Test
    fun `create repository, copy, check that equals uses iid only`() {
        val repo1 = Repository(localPath = "repo1", projectId = project.iid)
        val repo2 = repo1.copy(iid = Repository.Id(Uuid.random()))

        assertThat(repo1.iid).isNotEqualTo(repo2.iid)
        assertThat(repo1.uniqueKey).isEqualTo(repo2.uniqueKey)
        assertThat(repo1).isNotEqualTo(repo2)
    }

    @ParameterizedTest
    @ValueSource(strings = ["", " ", "\t", "\n"])
    fun `create repository with blank paths, should fail`(path: String) {
        assertThrows<IllegalArgumentException> {
            Repository(localPath = path, projectId = project.iid)
        }
    }

    @ParameterizedTest
    @ValueSource(strings = ["/path/to/repo", "C:\\path\\to\\repo", "relative/path", "./dot-path"])
    fun `create repository with allowed paths, should not fail`(path: String) {
        val repo = Repository(localPath = path, projectId = project.iid)
        assertThat(repo.localPath).isEqualTo(path)
    }

    @Nested
    inner class CommitsRelation {
        @Test
        fun `check commit references repositoryId`() {
            val author = Developer(name = "Author", email = "author@test.com", repositoryId = repository.iid)
            val sig = Signature(developerId = author.iid, timestamp = java.time.LocalDateTime.now().minusSeconds(1))
            val commit = Commit(sha = "a".repeat(40), authorSignature = sig, repositoryId = repository.iid)
            
            assertThat(commit.repositoryId).isEqualTo(repository.iid)
        }
    }

    @Nested
    inner class BranchesRelation {
        @Test
        fun `check branch references repositoryId`() {
            val branch = Branch(name = "main", fullName = "refs/heads/main", category = com.inso_world.binocular.model.vcs.ReferenceCategory.LOCAL_BRANCH, repositoryId = repository.iid, headSha = "a".repeat(40))
            assertThat(branch.repositoryId).isEqualTo(repository.iid)
        }
    }

    @Nested
    inner class DeveloperRelation {
        @Test
        fun `check developer references repositoryId`() {
            val developer = Developer(name = "Dev", email = "dev@test.com", repositoryId = repository.iid)
            assertThat(developer.repositoryId).isEqualTo(repository.iid)
        }
    }
}
