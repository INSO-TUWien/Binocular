package com.inso_world.binocular.infrastructure.sql.unit.mapper

import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RemoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.unit.mapper.base.BaseMapperTest
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.vcs.Remote
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import kotlin.uuid.Uuid

internal class RemoteMapperTest : BaseMapperTest() {
    @Nested
    inner class ToDomain {
        @Test
        fun `maps remote entity to domain`() {
            val projectEntity =
                ProjectEntity(
                    name = "test-project",
                    iid = Project.Id(Uuid.random())
                )
            val repoEntity =
                RepositoryEntity(
                    localPath = "/tmp/repo",
                    project = projectEntity,
                    iid = Repository.Id(Uuid.random())
                )
            val remoteEntity =
                RemoteEntity(
                    name = "origin",
                    url = "https://example.com/repo.git",
                    repository = repoEntity,
                    iid = Remote.Id(Uuid.random())
                ).apply { id = 30L }

            val domain = remoteMapper.toDomain(remoteEntity)

            assertAll(
                { assertThat(domain.name).isEqualTo(remoteEntity.name) },
                { assertThat(domain.url).isEqualTo(remoteEntity.url) },
                { assertThat(domain.iid).isEqualTo(remoteEntity.iid) },
            )
        }
    }
}
