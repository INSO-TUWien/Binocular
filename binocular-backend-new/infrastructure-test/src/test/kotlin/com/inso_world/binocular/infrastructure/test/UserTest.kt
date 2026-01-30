package com.inso_world.binocular.infrastructure.test

import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.core.service.UserInfrastructurePort
import com.inso_world.binocular.infrastructure.test.base.BaseInfrastructureSpringTest
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.User
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

internal class UserTest : BaseInfrastructureSpringTest() {
    @Autowired
    lateinit var userPort: UserInfrastructurePort

    @Autowired
    lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    lateinit var repositoryPort: RepositoryInfrastructurePort

    private lateinit var repository: Repository

    @BeforeEach
    fun setup() {
        val project = projectPort.create(Project(name = "proj-user-001"))
        repository = repositoryPort.create(Repository(localPath = "repo-user-001", project = project))
    }

    @AfterEach
    fun cleanup() {
    }

    @Test
    fun `create user and load it by id`() {
        val user = User(name = "Jane Doe", email = "jane@example.com", repository = repository)
        val created = userPort.create(user)
        val id = requireNotNull(created.id)
        assertNotNull(id)

        val loaded = userPort.findById(id)
        assertNotNull(loaded)
        loaded!!
        assertEquals(created.id, loaded.id)
        assertEquals(user.name, loaded.name)
        assertEquals(user.email, loaded.email)
        assertEquals(repository.id, loaded.repository?.id)
    }

    @Test
    fun `findAll returns created users`() {
        val u1 = userPort.create(User(name = "A", email = "a@example.com", repository = repository))
        val u2 = userPort.create(User(name = "B", email = "b@example.com", repository = repository))
        val all = userPort.findAll().toList()
        // at least 2 (could include other users if DB not fully isolated); ensure ours are present
        val ids = all.mapNotNull { it.id }.toSet()
        assert(ids.contains(u1.id) && ids.contains(u2.id))
    }
}
