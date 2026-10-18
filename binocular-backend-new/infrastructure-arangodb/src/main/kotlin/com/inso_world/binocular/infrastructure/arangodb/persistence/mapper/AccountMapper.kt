@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.PlatformEntity
import com.inso_world.binocular.model.*
import org.springframework.stereotype.Component
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mapper for Account domain objects.
 *
 * Converts between Account domain objects and AccountEntity persistence entities for ArangoDB.
 * This mapper handles the conversion and uses lazy loading proxies for relationships to issues,
 * merge requests, and notes.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Account structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded relationships
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It supports
 * lazy loading of related entities through proxy patterns.
 */
@Component
internal class AccountMapper : EntityMapper<Account, AccountEntity> {
    companion object {
        private val logger by logger()
    }

    /**
     * Converts an Account domain object to AccountEntity.
     *
     * Maps basic account properties including platform, login, name, avatar URL, and web URL.
     * Note that relationships (issues, merge requests, notes) are not included in the entity
     * and are only restored during toDomain through lazy loading.
     *
     * @param domain The Account domain object to convert
     * @return The AccountEntity (structure only, without relationships)
     */
    override fun toEntity(domain: Account): AccountEntity =
        AccountEntity(
            id = domain.id,
            iid = domain.iid.value,
            gid = domain.gid,
            platform = toPlatformEntity(domain.platform),
            login = domain.login,
            name = domain.name,
            avatarUrl = domain.avatarUrl,
            url = domain.url,
            // project = domain.project,
        )

    /**
     * Converts an AccountEntity to Account domain object.
     *
     * Creates an Account with lazy-loaded relationships to issues, merge requests, and notes.
     * The relationships are loaded on-demand using proxy patterns to avoid N+1 query problems.
     *
     * @param entity The AccountEntity to convert
     * @return The Account domain object with lazy-loaded relationships
     */
    @OptIn(ExperimentalUuidApi::class)
    override fun toDomain(entity: AccountEntity): Account {
        val domain =
            Account(
                gid = entity.gid,
                platform = toPlatform(entity.platform) ?: Platform.GitHub, // Default to GitHub if unknown
                login = entity.login,
                iid = entity.iid?.let { Account.Id(it) } ?: Account.Id(Uuid.random()),
            ).apply {
                this.id = entity.id
                this.name = entity.name
                this.avatarUrl = entity.avatarUrl
                this.url = entity.url
                this.projectIds.addAll(entity.projects.map { Project.Id(it.iid) })
            }

        domain.issueIds.addAll(
            entity.issues.mapNotNull { it.iid?.let { iid -> Issue.Id(iid) } }
        )

        domain.mergeRequestIds.addAll(
            entity.mergeRequests.mapNotNull { it.iid?.let { iid -> MergeRequest.Id(iid) } }
        )

        domain.noteIds.addAll(
            entity.notes.mapNotNull { it.iid?.let { iid -> Note.Id(iid) } }
        )

        return domain
    }

    private fun toPlatformEntity(platform: Platform): PlatformEntity =
        when (platform) {
            Platform.GitHub -> PlatformEntity.GitHub
            Platform.GitLab -> PlatformEntity.GitLab
        }

    private fun toPlatform(platformEntity: PlatformEntity): Platform? {
        if (platformEntity == PlatformEntity.GitHub) {
            return Platform.GitHub
        } else if (platformEntity == PlatformEntity.GitLab) {
            return Platform.GitLab
        }
        return null
    }
}
