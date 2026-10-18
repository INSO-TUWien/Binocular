@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.model.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mapper for MergeRequest domain objects.
 *
 * Converts between MergeRequest domain objects and MergeRequestEntity persistence entities for ArangoDB.
 * This mapper handles the conversion of merge request metadata, labels, mentions, and uses lazy loading
 * for related accounts, milestones, and notes.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts MergeRequest structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships
 * - **Eager Mentions**: Eagerly maps mentions as they are typically accessed with the merge request
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It eagerly maps
 * mentions but uses lazy loading for accounts, milestones, and notes to optimize performance.
 */
@OptIn(kotlin.uuid.ExperimentalUuidApi::class)
@Component
internal class MergeRequestMapper(
    @org.springframework.beans.factory.annotation.Autowired private val mentionMapper: MentionMapper,
) : EntityMapper<MergeRequest, MergeRequestEntity> {
    override fun toEntity(domain: MergeRequest): MergeRequestEntity =
        MergeRequestEntity(
            id = domain.id,
            iid = domain.iid.value,
            platformIid = domain.platformIid,
            title = domain.title,
            description = domain.description,
            createdAt = domain.createdAt,
            closedAt = domain.closedAt,
            updatedAt = domain.updatedAt,
            labels = domain.labels,
            state = domain.state,
            webUrl = domain.webUrl,
            mentions = domain.mentions.map { mentionMapper.toEntity(it) },
        )

    override fun toDomain(entity: MergeRequestEntity): MergeRequest {
        val domain =
            MergeRequest(
                project =
                    entity.project?.let { Project.Id(it.iid) }
                        ?: Project.Id(entity.iid ?: Uuid.random()),
                id = entity.id,
                platformIid = entity.platformIid,
                title = entity.title,
                description = entity.description,
                createdAt = entity.createdAt,
                closedAt = entity.closedAt,
                updatedAt = entity.updatedAt,
                labels = entity.labels,
                state = entity.state,
                webUrl = entity.webUrl,
                mentions = entity.mentions.map { mentionMapper.toDomain(it) },
                milestoneIds = entity.milestones.mapNotNull { it.iid?.let { iid -> Milestone.Id(iid) } }.toMutableSet(),
                noteIds = entity.notes.mapNotNull { it.iid?.let { iid -> Note.Id(iid) } }.toMutableSet(),
                iid = MergeRequest.Id(entity.iid!!),
            )

        domain.accountIds.addAll(
            entity.accounts.mapNotNull { it.iid?.let { iid -> Account.Id(iid) } }
        )

        return domain
    }

    override fun toDomainList(entities: Iterable<MergeRequestEntity>): List<MergeRequest> = entities.map { this.toDomain(it) }
}
