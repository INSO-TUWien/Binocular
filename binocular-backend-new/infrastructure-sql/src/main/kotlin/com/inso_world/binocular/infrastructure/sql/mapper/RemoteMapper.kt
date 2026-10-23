package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RemoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.vcs.Remote
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.util.ReflectionUtils.setField
import org.springframework.stereotype.Component

@Component
internal class RemoteMapper : EntityMapper<Remote, RemoteEntity> {
    @Autowired
    private lateinit var repositoryRepository: com.inso_world.binocular.infrastructure.sql.persistence.repository.RepositoryRepository

    override fun toEntity(domain: Remote): RemoteEntity {
        val repository =
            repositoryRepository.findByIid(domain.repositoryId.value)
                ?: throw IllegalStateException("RepositoryEntity with iid ${domain.repositoryId} not found")

        val entity = domain.toSqlEntity(repository)

        return entity
    }

    override fun toDomain(entity: RemoteEntity): Remote = entity.toDomain()

    /**
     * Refreshes a Remote domain object with data from the corresponding entity.
     *
     * This method updates the domain object's ID from the entity after persistence.
     * It does NOT update nested objects - only top-level Remote properties.
     *
     * @param target The Remote domain object to refresh
     * @param entity The RemoteEntity with updated data
     * @return The refreshed Remote domain object
     */
    fun refreshDomain(
        target: Remote,
        entity: RemoteEntity,
    ): Remote {
        setField(
            RemoteEntity::class.java.getDeclaredField("id"),
            target,
            entity.id?.toString()
        )
        return target
    }
}
