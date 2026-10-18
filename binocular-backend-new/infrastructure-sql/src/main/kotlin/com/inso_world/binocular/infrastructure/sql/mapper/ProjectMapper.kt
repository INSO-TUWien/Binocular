package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Project
import org.springframework.stereotype.Component

@Component
internal class ProjectMapper : EntityMapper<Project, ProjectEntity> {
    companion object {
        val logger by logger()
    }

    override fun toEntity(domain: Project): ProjectEntity {
        val entity = domain.toSqlEntity()
        return entity
    }

    @OptIn(kotlin.uuid.ExperimentalUuidApi::class)
    override fun toDomain(entity: ProjectEntity): Project {
        val domain =
            Project(
                name = entity.name,
                iid = entity.iid,
            ).apply {
                this.id = entity.id?.toString()
                this.description = entity.description
            }

        return domain
    }

    fun refreshDomain(
        target: Project,
        entity: ProjectEntity
    ): Project {
        target.id = entity.id?.toString()
        return target
    }
}
