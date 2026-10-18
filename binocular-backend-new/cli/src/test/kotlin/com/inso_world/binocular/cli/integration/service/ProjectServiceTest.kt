package com.inso_world.binocular.cli.integration.service

import com.inso_world.binocular.cli.integration.service.base.BaseServiceTest
import com.inso_world.binocular.cli.service.ProjectService
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.springframework.beans.factory.annotation.Autowired

internal class ProjectServiceTest
    @Autowired
    constructor(
        private val projectService: ProjectService,
        private val projectPort: ProjectInfrastructurePort,
    ) : BaseServiceTest() {
        @Test
        fun `getOrCreateProject creates new project when missing`() {
            val result = projectService.getOrCreateProject("test-project")

            assertAll(
                { assertThat(result).isNotNull },
                { assertThat(result.name).isEqualTo("test-project") },
            )
        }

        @Test
        fun `getOrCreateProject returns existing project`() {
            val created = projectService.getOrCreateProject("existing-project")

            val result = projectService.getOrCreateProject("existing-project")

            assertAll(
                { assertThat(result).isNotNull },
                { assertThat(result.id).isEqualTo(created.id) },
                { assertThat(result.name).isEqualTo("existing-project") },
            )
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `addIssues does nothing when no new issues`() {
        }

        @Test
        @Disabled("Refactored in domain model #454")
        fun `transformIssues links accounts and adds issues to project`() {
        }
    }
