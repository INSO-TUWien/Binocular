package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.toArangoEntity
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.User
import org.springframework.stereotype.Component

/**
 * Mapper for User domain objects.
 *
 * Converts between User domain objects and UserEntity persistence entities for ArangoDB.
 * This mapper intentionally keeps the conversion shallow; it does not traverse commit graphs.
 *
 * ## Design Principles
 * - **Single Responsibility**: Only converts User structure
 * - **No Deep Traversal**: Does not automatically map commit relationships
 *
 * ## Usage
 * This mapper is typically called by infrastructure ports and assemblers. The `toDomain`
 * repository reference.
 *
 * @deprecated Use [DeveloperMapper] instead. This mapper is maintained for backwards compatibility
 * with the deprecated [User] model.
 */
@Suppress("DEPRECATION")
@Component
internal class UserMapper : EntityMapper<User, UserEntity> {
    companion object {
        private val logger by logger()
    }

    /**
     * Converts a User domain object to UserEntity.
     *
     * @param domain The User domain object to convert
     * @return The UserEntity (structure only, without relationships)
     */
    override fun toEntity(domain: User): UserEntity {
        val owner =
            RepositoryEntity(
                iid = domain.repositoryId.value,
                localPath = "",
                project = ProjectEntity(iid = domain.repositoryId.value, name = "")
            )

        val entity = domain.toArangoEntity(owner)
        return entity
    }

    /**
     * Converts a UserEntity to User domain object.
     *
     * @param entity The UserEntity to convert
     * @return The User domain object (structure only, without relationships)
     */
    override fun toDomain(entity: UserEntity): User {
        val domain =
            User(
                name = entity.name,
                repositoryId = entity.repository?.let { Repository.Id(it.iid) } ?: Repository.Id(entity.iid),
                iid = User.Id(entity.iid)
            ).apply {
                this.id = entity.id
                this.email = entity.email
            }

        return domain
    }

    /**
     * Refreshes a User domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level User properties.
     *
     * @param target The User domain object to refresh
     * @param entity The UserEntity with updated data
     * @return The refreshed User domain object
     */
    fun refreshDomain(
        target: User,
        entity: UserEntity,
    ): User {
        if (target.id.equals(entity.id)) {
            return target
        }
        target.id = entity.id

        return target
    }
}
