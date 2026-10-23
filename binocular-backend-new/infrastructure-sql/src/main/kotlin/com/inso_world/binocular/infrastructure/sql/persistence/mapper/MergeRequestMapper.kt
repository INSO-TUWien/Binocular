package com.inso_world.binocular.infrastructure.sql.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository
import com.inso_world.binocular.model.MergeRequest
import org.springframework.stereotype.Component

@Component
internal class MergeRequestMapper(
    private val projectRepository: ProjectRepository
) : EntityMapper<MergeRequest, MergeRequestEntity> {
    override fun toEntity(domain: MergeRequest): MergeRequestEntity {
        val projectEntity =
            projectRepository.findByIid(domain.project.value)
                ?: throw IllegalArgumentException("Project not found: ${domain.project}")

        return MergeRequestEntity(
            id = domain.id?.toLongOrNull(),
            iid = domain.iid,
            platformIid = domain.platformIid,
            title = domain.title,
            description = domain.description,
            createdAt = domain.createdAt,
            closedAt = domain.closedAt,
            updatedAt = domain.updatedAt,
            state = domain.state,
            webUrl = domain.webUrl,
            project = projectEntity
        )
    }

    override fun toDomain(entity: MergeRequestEntity): MergeRequest =
        MergeRequest(
            project = entity.project?.iid ?: throw IllegalStateException("Project missing for MergeRequest ${entity.iid}"),
            id = entity.id?.toString(),
            platformIid = entity.platformIid,
            title = entity.title,
            description = entity.description,
            createdAt = entity.createdAt,
            closedAt = entity.closedAt,
            updatedAt = entity.updatedAt,
            state = entity.state,
            webUrl = entity.webUrl,
            iid = entity.iid
        ).apply {
            noteIds.addAll(entity.notes.map { it.iid })
            milestoneIds.addAll(entity.milestones.map { it.iid })
            accountIds.addAll(entity.accounts.map { it.iid })
        }
}
