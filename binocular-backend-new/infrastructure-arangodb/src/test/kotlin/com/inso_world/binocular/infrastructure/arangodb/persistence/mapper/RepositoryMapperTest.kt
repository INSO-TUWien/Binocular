package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.base.BaseMapperTest
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
internal class RepositoryMapperTest : BaseMapperTest() {

    @Nested
    inner class ToEntity {
        @Test
        fun `toEntity maps domain object to entity`() {
            val project = Project(name = "test-project")
            val domain = Repository(
                localPath = "/tmp/repo",
                projectId = project.iid
            ).apply {
                id = "r-10"
                this.project = project
            }

            val entity = repositoryMapper.toEntity(domain)

            assertAll(
                { assertThat(entity.id).isEqualTo("r-10") },
                { assertThat(entity.localPath).isEqualTo(domain.localPath) },
                { assertThat(entity.project?.name).isEqualTo(project.name) },
                { assertThat(entity.iid).isEqualTo(domain.iid.value) }
            )
        }
    }

    @Nested
    inner class ToDomain {
        @Test
        fun `toDomain maps entity to domain object`() {
            val uuid = Uuid.random()
            val projectEntity = ProjectEntity(
                name = "test-project",
                iid = Uuid.random()
            )
            val entity = RepositoryEntity(
                localPath = "/tmp/repo",
                project = projectEntity,
                iid = uuid
            ).apply {
                id = "r-10"
            }

            val domain = repositoryMapper.toDomain(entity)

            assertAll(
                { assertThat(domain.id).isEqualTo("r-10") },
                { assertThat(domain.localPath).isEqualTo(entity.localPath) },
                { assertThat(domain.projectId.value).isEqualTo(projectEntity.iid) },
                { assertThat(domain.iid.value).isEqualTo(entity.iid) }
            )
        }
    }
}