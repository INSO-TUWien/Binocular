package com.inso_world.binocular.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource

class ProjectModelTest {
    @Test
    fun `create empty project, checks that iid is created automatically`() {
        val project = Project(name = "test-project")

        assertThat(project.iid).isNotNull()
    }

    @Test
    fun `create user, validate hashCode is same based on iid`() {
        val project = Project(name = "test-project")

        assertThat(project.hashCode()).isEqualTo(project.iid.hashCode())
    }

    @Test
    fun `create user, validate uniqueKey`() {
        val project = Project(name = "test-project")

        assertAll(
            { assertThat(project.uniqueKey).isEqualTo(Project.Key("test-project")) },
            { assertThat(project.uniqueKey.name).isEqualTo(project.name) },
        )
    }

    @Test
    fun `create projects, check that equals uses iid only`() {
        val projectA = Project(name = "test-project")
        val projectB = Project(name = "test-project") // same name

        assertThat(projectA).isNotEqualTo(projectB)
    }

    @Test
    fun `create projects via copy, check that equals they are equal`() {
        val projectA = Project(name = "test-project")
        val originIid = projectA.iid
        val projectB = projectA.copy(iid = originIid)

        assertThat(projectA).isNotSameAs(projectB)
        assertThat(projectA.iid).isEqualTo(originIid)
        assertThat(projectA.iid).isEqualTo(projectB.iid)
        assertThat(projectA).isEqualTo(projectB)
    }

    @Test
    fun `create project with repository, check repository links back to project id`() {
        val project = Project(name = "test-project")
        val repository = Repository(
            localPath = "test",
            projectId = project.iid,
        )
        
        assertThat(repository.projectId).isEqualTo(project.iid)
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideBlankStrings")
    fun `create project with blank name, should fail`(name: String) {
        assertThrows<IllegalArgumentException> { Project(name) }
    }

    @ParameterizedTest
    @MethodSource("com.inso_world.binocular.domain.data.DummyTestData#provideAllowedStrings")
    fun `create project with allowed names, should pass`(name: String) {
        assertDoesNotThrow { Project(name) }
    }

    @Test
    fun `create project with description`() {
        val project =
            Project(name = "test-project").apply {
                description = "test-description"
            }

        assertThat(project.description).isEqualTo("test-description")
    }
}
