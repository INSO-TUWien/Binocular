package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.core.persistence.proxy.RelationshipProxyFactory
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BuildEntity
import com.inso_world.binocular.model.Build
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component
import java.time.ZoneOffset
import java.util.Date

/**
 * Mapper for Build domain objects.
 *
 * Converts between Build domain objects and BuildEntity persistence entities for ArangoDB.
 * This mapper handles the conversion of build metadata, timestamps, and jobs, using lazy loading
 * for related commits.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Build structure
 * - **Lazy Loading**: Uses RelationshipProxyFactory for lazy-loaded commit relationships
 * - **Date Conversion**: Converts between LocalDateTime and Date for ArangoDB storage
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. It eagerly maps
 * jobs but uses lazy loading for commits to optimize performance.
 */
@OptIn(kotlin.uuid.ExperimentalUuidApi::class)
@Component
internal class BuildMapper
    @Autowired
    constructor(
        private val proxyFactory: RelationshipProxyFactory,
        private val jobMapper: JobMapper
    ) : EntityMapper<Build, BuildEntity> {

        @Lazy
        @Autowired
        private lateinit var commitMapper: CommitMapper

        companion object {
            private val logger by logger()
        }

        /**
         * Converts a Build domain object to BuildEntity.
         *
         * Converts all timestamp fields from LocalDateTime to Date for ArangoDB storage.
         * Eagerly maps all jobs as they are typically accessed together with the build.
         * Commit relationships are not persisted in the entity - they are only restored
         * during toDomain through lazy loading.
         *
         * @param domain The Build domain object to convert
         * @return The BuildEntity with all properties and jobs
         */
        override fun toEntity(domain: Build): BuildEntity =
            BuildEntity(
                id = domain.id,
                iid = domain.iid.value,
                sha = domain.sha,
                ref = domain.ref,
                status = domain.status,
                tag = domain.tag,
                user = domain.user,
                userFullName = domain.userFullName,
                createdAt = domain.createdAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
                updatedAt = domain.updatedAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
                startedAt = domain.startedAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
                finishedAt = domain.finishedAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
                committedAt = domain.committedAt?.let { Date.from(it.toInstant(ZoneOffset.UTC)) },
                duration = domain.duration,
                jobs = domain.jobs.map { jobMapper.toEntity(it) },
                webUrl = domain.webUrl,
            )

        /**
         * Converts a BuildEntity to Build domain object.
         *
         * Converts all timestamp fields from Date to LocalDateTime. Eagerly maps all jobs
         * and creates lazy-loaded proxies for commits to avoid loading unnecessary data.
         *
         * @param entity The BuildEntity to convert
         * @return The Build domain object with eager jobs and lazy commits
         */
        override fun toDomain(entity: BuildEntity): Build {
            // Fast-path: Check if already mapped

            val domain =
                Build(
                    id = entity.id,
                    iid = Build.Id(entity.iid),
                    sha = entity.sha,
                    ref = entity.ref,
                    status = entity.status,
                    tag = entity.tag,
                    user = entity.user,
                    userFullName = entity.userFullName,
                    createdAt =
                        entity.createdAt
                            ?.toInstant()
                            ?.atZone(ZoneOffset.UTC)
                            ?.toLocalDateTime(),
                    updatedAt =
                        entity.updatedAt
                            ?.toInstant()
                            ?.atZone(ZoneOffset.UTC)
                            ?.toLocalDateTime(),
                    startedAt =
                        entity.startedAt
                            ?.toInstant()
                            ?.atZone(ZoneOffset.UTC)
                            ?.toLocalDateTime(),
                    finishedAt =
                        entity.finishedAt
                            ?.toInstant()
                            ?.atZone(ZoneOffset.UTC)
                            ?.toLocalDateTime(),
                    committedAt =
                        entity.committedAt
                            ?.toInstant()
                            ?.atZone(ZoneOffset.UTC)
                            ?.toLocalDateTime(),
                    duration = entity.duration,
                    jobs = entity.jobs.map { jobMapper.toDomain(it) },
                    webUrl = entity.webUrl,
                    commitIds = (entity.commits ?: emptyList()).map { com.inso_world.binocular.model.Commit.Id(it.iid) },
                    commits =
                        proxyFactory.createLazyList {
                            (entity.commits ?: emptyList()).map { commitEntity ->
                                commitMapper.toDomain(commitEntity)
                            }
                        },
                )

            return domain
        }

        override fun toDomainList(entities: Iterable<BuildEntity>): List<Build> = entities.map { toDomain(it) }
    }
