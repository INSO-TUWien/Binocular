package com.inso_world.binocular.infrastructure.test

import com.inso_world.binocular.core.data.MockTestDataProvider
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.test.base.BaseInfrastructureSpringTest
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Signature
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDateTime

/**
 * Integration tests for Repository persistence via RepositoryInfrastructurePort.
 * Tests verify that domain model semantics (particularly bidirectional relationships)
 * are preserved through the infrastructure layer.
 */
internal class RepositoryTest : BaseInfrastructureSpringTest() {
    @Autowired
    lateinit var repositoryPort: RepositoryInfrastructurePort

    private lateinit var project: Project
    private lateinit var mockData: MockTestDataProvider

    @Autowired
    lateinit var projectPort: ProjectInfrastructurePort

    @BeforeEach
    fun setUp() {
        mockData = MockTestDataProvider()
        project = projectPort.create(Project(name = "proj-repo-rt-001"))
    }

    @Test
    fun `find all repositories, expect non empty list`() {
        assertThat(repositoryPort.findAll()).hasSize(7)
    }

    @Test
    fun `create repository and find by iid`() {
        val repo = Repository(localPath = "repo-rt-001", project = project)
        val created = repositoryPort.create(repo)
        assertNotNull(created.id)

        val loadedByIid = repositoryPort.findByIid(requireNotNull(created.iid))
        assertNotNull(loadedByIid)
        assertAll(
            { assertEquals(created.id, loadedByIid!!.id) },
            { assertEquals(repo.localPath, loadedByIid!!.localPath) },
            { assertEquals(project.id, loadedByIid!!.project?.id) },
        )

        val loadedByName = repositoryPort.findByName(repo.localPath)
        assertNotNull(loadedByName)
        assertEquals(created.id, loadedByName!!.id)
    }

    @Test
    fun `create repository, verify automatic registration with project`() {
        val newProject = this.project
        val repo = Repository(localPath = "repo-rt-002", project = newProject)

        // Repository auto-registers with project during construction
        assertAll(
            { assertNotNull(newProject.repo) },
            { assertEquals(repo, newProject.repo) },
        )

        val created = repositoryPort.create(repo)
        assertNotNull(created.id)

        // Verify bidirectional relationship persists
        assertAll(
            { assertEquals(newProject.iid, created.project.iid, "created.project.iid") },
            { assertEquals(repo.iid, created.iid, "created.iid") },
        )
    }

    @Test
    fun `repository commits collection is add-only`() {
        val repo = Repository(localPath = "repo-rt-003", project = Project(name = "test-project-2"))
        val developer = Developer(name = "Test Committer", email = "committer@test.com", repository = repo)
        val commit =
            Commit(
                sha = "d".repeat(40),
                message = "test commit",
                authorSignature = Signature(developer = developer, timestamp = LocalDateTime.now()),
                repository = repo,
            )

        // Commits auto-register with repository during construction
        assertEquals(1, repo.commits.size)
        assert(repo.commits.contains(commit))

        // Removal operations should throw UnsupportedOperationException
        org.junit.jupiter.api.assertThrows<UnsupportedOperationException> {
            repo.commits.remove(commit)
        }

        org.junit.jupiter.api.assertThrows<UnsupportedOperationException> {
            repo.commits.clear()
        }
    }
}
