package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.base.BaseMapperTest
import com.inso_world.binocular.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import kotlin.uuid.Uuid

internal class ProjectMapperTest : BaseMapperTest() {
    @Nested
    inner class ToEntity {
        @Test
        fun `toEntity maps domain object to entity`() {
            val domain =
                Project(
                    name = "test-project",
                ).apply {
                    this.id = "p-42"
                }

            val entity = projectMapper.toEntity(domain)

            assertAll(
                { assertThat(entity.id).isEqualTo("p-42") },
                { assertThat(entity.name).isEqualTo(domain.name) },
                { assertThat(entity.iid).isEqualTo(domain.iid.value) }
            )
        }
    }

    @Nested
    inner class ToDomain {
        @Test
        fun `toDomain maps entity to domain object`() {
            val uuid = Uuid.random()
            val entity =
                ProjectEntity(
                    name = "test-project",
                    iid = uuid
                ).apply {
                    id = "p-42"
                }

            val domain = projectMapper.toDomain(entity)

            assertAll(
                { assertThat(domain.id).isEqualTo("p-42") },
                { assertThat(domain.name).isEqualTo(entity.name) },
                { assertThat(domain.iid.value).isEqualTo(entity.iid) }
            )
        }
    }

    @Nested
    inner class RefreshDomain {
        @Test
        fun `refreshDomain updates domain id from entity`() {
            val domain = Project(name = "test-project")
            val entity =
                ProjectEntity(
                    name = "test-project",
                    iid = domain.iid.value
                ).apply {
                    id = "p-100"
                }

            projectMapper.refreshDomain(domain, entity)

            assertThat(domain.id).isEqualTo("p-100")
        }
    }
}
