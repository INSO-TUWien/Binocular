package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Branch
import jakarta.validation.Valid
import org.springframework.data.util.ReflectionUtils.setField
import org.springframework.stereotype.Component

/**
 * Mapper for Branch domain objects.
 *
 * Converts between Branch domain objects and BranchEntity persistence entities.
 * This is a **simple mapper** - it only handles basic conversion without orchestrating
 * complex relationships.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Branch structure
 * - **Aggregate Boundaries**: Expects Repository and Commit already in MappingContext (cross-aggregate references)
 * - **No Deep Traversal**: Does not map entire commit history or file structures
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. Direct usage
 * is also supported for `refreshDomain` operations after persistence.
 */
@Component
internal class BranchMapper : EntityMapper<Branch, BranchEntity> {
    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Branch domain object to BranchEntity.
     *
     * @param domain The Branch domain object to convert
     * @return The BranchEntity (structure only)
     */
    @Deprecated("Use toEntity(domain, owner, head) instead", ReplaceWith("toEntity(domain, owner, head)"))
    override fun toEntity(domain: Branch): BranchEntity =
        throw UnsupportedOperationException("Mapping to entity now requires explicit owner and head entities.")

    fun toEntity(
        domain: Branch,
        owner: RepositoryEntity,
        head: CommitEntity
    ): BranchEntity = domain.toSqlEntity(owner, head)

    /**
     * Converts a BranchEntity to Branch domain object.
     *
     * @param entity The BranchEntity to convert
     * @return The Branch domain object (structure only)
     */
    override fun toDomain(entity: BranchEntity): @Valid Branch {
        val domain = entity.toDomain()
        setField(
            domain.javaClass.superclass.superclass
                .getDeclaredField("iid"),
            domain,
            entity.iid,
        )

        return domain
    }

    /**
     * Refreshes a Branch domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level Branch properties.
     *
     * @param target The Branch domain object to refresh
     * @param entity The BranchEntity with updated data
     * @return The refreshed Branch domain object
     */
    fun refreshDomain(
        target: Branch,
        entity: BranchEntity,
    ): Branch {
        setField(
            target.javaClass.getDeclaredField("id"),
            target,
            entity.id?.toString(),
        )
        return target
    }
}
