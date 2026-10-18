package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Developer
import org.springframework.data.util.ReflectionUtils.setField
import org.springframework.stereotype.Component

/**
 * Mapper for Developer domain objects.
 *
 * Converts between Developer domain objects and DeveloperEntity persistence entities.
 * This mapper intentionally keeps the conversion shallow; it does not traverse commit graphs.
 */
@Component
internal class DeveloperMapper : EntityMapper<Developer, DeveloperEntity> {
    companion object {
        private val logger by logger()
    }

    override fun toEntity(domain: Developer): DeveloperEntity =
        throw UnsupportedOperationException("Mapping to entity now requires explicit repository entity.")

    fun toEntity(
        domain: Developer,
        repository: RepositoryEntity
    ): DeveloperEntity = domain.toSqlEntity(repository)

    override fun toDomain(entity: DeveloperEntity): Developer {
        val domain = entity.toDomain()
        setField(
            domain.javaClass.superclass.superclass
                .getDeclaredField("iid"),
            domain,
            entity.iid
        )
        return domain
    }

    fun refreshDomain(
        target: Developer,
        entity: DeveloperEntity,
    ): Developer {
        if (target.id.equals(entity.id?.toString())) {
            return target
        }
        setField(
            target.javaClass.getDeclaredField("id"),
            target,
            entity.id?.toString()
        )
        return target
    }
}
