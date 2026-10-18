package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Commit
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.util.ReflectionUtils.setField
import org.springframework.stereotype.Component

/**
 * Mapper for Commit domain objects.
 *
 * Converts between Commit domain objects and CommitEntity persistence entities.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * complex relationships like full commit history graphs.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Commit structure
 * - **Aggregate Boundaries**: Expects Repository already in MappingContext (cross-aggregate reference)
 * - **No Deep Traversal**: Does not automatically map entire parent/child commit graphs
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class CommitMapper : EntityMapper<Commit, CommitEntity> {
    @Autowired
    private lateinit var developerMapper: DeveloperMapper

    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Commit domain object to CommitEntity.
     */
    @Deprecated("Use toEntity(domain, repository, author, committer) instead")
    override fun toEntity(domain: Commit): CommitEntity =
        throw UnsupportedOperationException("Mapping to entity now requires explicit dependencies.")

    fun toEntity(
        domain: Commit,
        repository: RepositoryEntity,
        author: DeveloperEntity,
        committer: DeveloperEntity
    ): CommitEntity =
        domain.toSqlEntity(
            repository = repository,
            author = author,
            committer = committer,
        )

    /**
     * Converts a CommitEntity to Commit domain object.
     */
    override fun toDomain(entity: CommitEntity): Commit {
        val domain = entity.toDomain()
        setField(
            domain.javaClass.superclass.getDeclaredField("iid"),
            domain,
            entity.iid,
        )

        return domain
    }

    /**
     * Refreshes a Commit domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It also recursively refreshes parent and child commits, as well as author/committer.
     *
     * **Note**: This method performs recursive updates on parent/child relationships.
     *
     * @param target The Commit domain object to refresh
     * @param entity The CommitEntity with updated data
     * @return The refreshed Commit domain object
     */
    fun refreshDomain(
        target: Commit,
        entity: CommitEntity,
    ): Commit {
        setField(
            target.javaClass.getDeclaredField("id"),
            target,
            entity.id?.toString(),
        )

        return target
    }
}
