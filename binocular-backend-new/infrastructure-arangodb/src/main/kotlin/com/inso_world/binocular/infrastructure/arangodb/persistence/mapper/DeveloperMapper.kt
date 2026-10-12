@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.Repository
import org.springframework.stereotype.Component
import kotlin.uuid.ExperimentalUuidApi

/**
 * Mapper for Developer domain objects.
 *
 * Converts between Developer domain objects and DeveloperEntity persistence entities for ArangoDB.
 * This mapper intentionally keeps the conversion shallow; it does not traverse commit graphs.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts Developer structure
 * - **No Deep Traversal**: Does not automatically map commit relationships
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. The `toDomain`
 * repository reference.
 */
@Component
internal class DeveloperMapper : EntityMapper<Developer, DeveloperEntity> {

    companion object {
        private val logger by logger()
    }

    /**
     * Converts a Developer domain object to DeveloperEntity.
     *
     * @param domain The Developer domain object to convert
     * @return The DeveloperEntity (structure only, without relationships)
     */
    @OptIn(ExperimentalUuidApi::class)
    override fun toEntity(domain: Developer): DeveloperEntity {
        val owner = RepositoryEntity(
            iid = domain.repositoryId.value,
            localPath = "",
            project = ProjectEntity(iid = domain.repositoryId.value, name = "")
        )
        val entity = domain.toArangoEntity(owner)
        return entity
    }

    /**
     * Converts a DeveloperEntity to Developer domain object.
     *
     * @param entity The DeveloperEntity to convert
     * @return The Developer domain object (structure only, without relationships)
     */
    override fun toDomain(entity: DeveloperEntity): Developer {
        val domain = Developer(
            name = entity.name,
            email = entity.email,
            repositoryId = entity.repository?.let { Repository.Id(it.iid) } ?: Repository.Id(entity.iid.value),
            iid = entity.iid
        ).apply {
            this.id = entity.id
        }
        return domain
    }

    /**
     * Refreshes a Developer domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level Developer properties.
     *
     * @param target The Developer domain object to refresh
     * @param entity The DeveloperEntity with updated data
     * @return The refreshed Developer domain object
     */
    fun refreshDomain(
        target: Developer,
        entity: DeveloperEntity,
    ): Developer {
        if (target.id.equals(entity.id)) {
            return target
        }
        target.id = entity.id

        return target
    }
}
