@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Project
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component
import java.time.ZoneOffset
import java.util.Date
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mapper for Issue domain objects.
 *
 * Converts between Issue domain objects and IssueEntity persistence entities for ArangoDB.
 * This mapper handles the conversion of issue metadata, labels, mentions, and uses lazy loading
 * for related accounts, commits, milestones, notes, and users.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Issue structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships
 * - **Date Conversion**: Converts between LocalDateTime and Date for ArangoDB storage
 * - **Eager Mentions**: Eagerly maps mentions as they are typically accessed with the issue
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It eagerly maps
 * mentions but uses lazy loading for accounts, commits, milestones, notes, and users to optimize performance.
 */
@Component
internal class IssueMapper(
    @org.springframework.beans.factory.annotation.Autowired private val mentionMapper: com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.MentionMapper,
) : EntityMapper<Issue, IssueEntity> {

    override fun toEntity(domain: Issue): IssueEntity =
        IssueEntity(
            id = domain.id,
            iid = domain.iid.value,
            platformIid = domain.platformIid,
            title = domain.title,
            description = domain.description,
            createdAt = domain.createdAt?.let { java.util.Date.from(it.toInstant(java.time.ZoneOffset.UTC)) },
            closedAt = domain.closedAt?.let { java.util.Date.from(it.toInstant(java.time.ZoneOffset.UTC)) },
            updatedAt = domain.updatedAt?.let { java.util.Date.from(it.toInstant(java.time.ZoneOffset.UTC)) },
            labels = domain.labels,
            state = domain.state,
            webUrl = domain.webUrl,
            gid = domain.gid,
            mentions = domain.mentions.map { m -> this.mentionMapper.toEntity(m) },
        )

    override fun toDomain(entity: IssueEntity): Issue {
        val domain =
            Issue(
                id = entity.id,
                platformIid = entity.platformIid,
                gid = entity.gid,
                title = entity.title,
                description = entity.description,
                createdAt =
                entity.createdAt
                    ?.toInstant()
                    ?.atZone(java.time.ZoneOffset.UTC)
                    ?.toLocalDateTime(),
                closedAt =
                entity.closedAt
                    ?.toInstant()
                    ?.atZone(java.time.ZoneOffset.UTC)
                    ?.toLocalDateTime(),
                updatedAt =
                entity.updatedAt
                    ?.toInstant()
                    ?.atZone(java.time.ZoneOffset.UTC)
                    ?.toLocalDateTime(),
                labels = entity.labels,
                state = entity.state,
                webUrl = entity.webUrl,
                mentions = entity.mentions.map { me -> this.mentionMapper.toDomain(me) },
                project =
                entity.project?.let { p -> Project.Id(p.iid) }
                    ?: Project.Id(entity.iid ?: Uuid.random()),
                accountIds = entity.accounts.mapNotNull { a -> a.iid?.let { iid -> Account.Id(iid) } }.toSet(),
                commitIds = entity.commits.mapNotNull { c -> c.iid?.let { iid -> Commit.Id(iid) } }.toSet(),
                milestoneIds = entity.milestones.mapNotNull { ms -> ms.iid?.let { iid -> Milestone.Id(iid) } }.toSet(),
                noteIds = entity.notes.mapNotNull { n -> n.iid?.let { iid -> Note.Id(iid) } }.toSet(),
                developerIds = entity.users.mapNotNull { u -> u.iid?.let { iid -> Developer.Id(iid) } }.toSet(),
                iid = Issue.Id(entity.iid!!),
            )

        return domain
    }

    override fun toDomainList(entities: Iterable<IssueEntity>): List<Issue> {
        return entities.map { e -> this.toDomain(e) }
    }
}
