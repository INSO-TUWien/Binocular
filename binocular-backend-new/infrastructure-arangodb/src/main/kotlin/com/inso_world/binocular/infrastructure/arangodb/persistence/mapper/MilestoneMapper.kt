package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MilestoneEntity
import com.inso_world.binocular.model.*
import org.springframework.stereotype.Component
import kotlin.uuid.Uuid

/**
 * Mapper for Milestone domain objects.
 *
 * Converts between Milestone domain objects and MilestoneEntity persistence entities for ArangoDB.
 * This mapper handles the conversion of milestone metadata and uses lazy loading for related
 * issues and merge requests.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Milestone structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships (issues, merge requests)
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It uses lazy loading
 * for issues and merge requests to optimize performance when accessing milestone metadata.
 */
@Component
internal class MilestoneMapper : EntityMapper<Milestone, MilestoneEntity> {
    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Milestone domain object to MilestoneEntity.
     *
     * Maps all milestone properties including metadata, dates, and state.
     *
     * @param domain The Milestone domain object to convert
     * @return The MilestoneEntity with milestone metadata
     */
    override fun toEntity(domain: Milestone): MilestoneEntity {
        val entity =
            MilestoneEntity(
                id = domain.id,
                iid = domain.iid.value,
                platformIid = domain.platformIid,
                title = domain.title,
                description = domain.description,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt,
                startDate = domain.startDate,
                dueDate = domain.dueDate,
                state = domain.state,
                expired = domain.expired,
                webUrl = domain.webUrl,
            )
        return entity
    }

    override fun toDomain(entity: MilestoneEntity): Milestone {
        // Fast-path: Check if already mapped

        val domain =
            Milestone(
                id = entity.id,
                platformIid = entity.platformIid,
                title = entity.title,
                description = entity.description,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
                startDate = entity.startDate,
                dueDate = entity.dueDate,
                state = entity.state,
                expired = entity.expired,
                webUrl = entity.webUrl,
                project =
                    entity.project?.let { Project.Id(it.iid) }
                        ?: Project.Id(entity.iid ?: Uuid.random()),
                issueIds = entity.issues.mapNotNull { it.iid?.let { iid -> Issue.Id(iid) } }.toMutableSet(),
                mergeRequestIds = entity.mergeRequests.mapNotNull { it.iid?.let { iid -> MergeRequest.Id(iid) } }.toMutableSet(),
                iid = Milestone.Id(entity.iid!!),
            )

        return domain
    }

    override fun toDomainList(entities: Iterable<MilestoneEntity>): List<Milestone> = entities.map { toDomain(it) }
}
