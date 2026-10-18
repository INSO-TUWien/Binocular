package com.inso_world.binocular.infrastructure.sql.unit.mapper

import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.unit.mapper.base.BaseMapperTest
import com.inso_world.binocular.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
internal class ProjectMapperTest : BaseMapperTest() {
    @Nested
    inner class ToEntity {
        @Test
        fun `toEntity maps domain object to entity`() {
            val domain =
                Project(
                    name = "test-project",
                ).apply {
                    this.id = "42"
                }

            val entity = projectMapper.toEntity(domain)

            assertAll(
                { assertThat(entity.id).isEqualTo(42L) },
                { assertThat(entity.name).isEqualTo(domain.name) },
                { assertThat(entity.iid).isEqualTo(domain.iid) }
            )
        }
    }

    @Nested
    inner class ToDomain {
        @Test
        fun `toDomain maps entity to domain object`() {
            val entity =
                ProjectEntity(
                    name = "test-project",
                    iid = Project.Id(Uuid.random())
                ).apply {
                    id = 42L
                }

            val domain = projectMapper.toDomain(entity)

            assertAll(
                { assertThat(domain.id).isEqualTo("42") },
                { assertThat(domain.name).isEqualTo(entity.name) },
                { assertThat(domain.iid).isEqualTo(entity.iid) }
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
                    iid = domain.iid
                ).apply {
                    id = 100L
                }

            val refreshed = projectMapper.refreshDomain(domain, entity)

            assertThat(refreshed.id).isEqualTo("100")
        }
    }
}
