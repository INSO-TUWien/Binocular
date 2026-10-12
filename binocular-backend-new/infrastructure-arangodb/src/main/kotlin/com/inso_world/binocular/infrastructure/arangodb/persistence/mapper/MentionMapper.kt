@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MentionEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Mention
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.time.ZoneOffset
import java.util.Date
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mapper for Mention value objects.
 *
 * Converts between Mention domain value objects and MentionEntity persistence entities for ArangoDB.
 * Mentions represent references to commits within issues or merge requests.
 *
 * ## Design Principles
 * - **Value Object**: Mention is a value object typically embedded within Issue
 * - **Date Conversion**: Converts between LocalDateTime and Date for ArangoDB storage
 *
 * ## Usage
 * This mapper is primarily used by IssueMapper to convert mentions within issue entities.
 */
@Component
internal class MentionMapper : EntityMapper<Mention, MentionEntity> {

    /**
     * Converts a Mention value object to MentionEntity.
     *
     * Maps commit SHA reference, creation timestamp, and whether the mention closes an issue.
     *
     * @param domain The Mention value object to convert
     * @return The MentionEntity with commit reference and metadata
     */
    override fun toEntity(domain: Mention): MentionEntity =
        MentionEntity(
            commit = domain.commit,
            createdAt = domain.createdAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
            closes = domain.closes
        )

    /**
     * Converts a MentionEntity to Mention value object.
     *
     * Converts the creation timestamp from Date to LocalDateTime.
     *
     * @param entity The MentionEntity to convert
     * @return The Mention value object with commit reference and metadata
     */
    @OptIn(ExperimentalUuidApi::class)
    override fun toDomain(entity: MentionEntity): Mention {
        // Fast-path: Check if already mapped

        return Mention(
            commit = entity.commit,
            createdAt =
                entity.createdAt
                    ?.toInstant()
                    ?.atZone(ZoneOffset.UTC)
                    ?.toLocalDateTime(),
            closes = entity.closes,
            actorId = entity.actor?.iid?.let { Account.Id(it) }
        )
    }
}
