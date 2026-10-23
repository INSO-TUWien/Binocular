package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RemoteEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.model.vcs.Remote
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Mapper for Remote domain objects.
 */
@Component
internal class RemoteMapper(
    @Autowired @Lazy private val repositoryMapper: RepositoryMapper,
) : EntityMapper<Remote, RemoteEntity> {
    override fun toEntity(domain: Remote): RemoteEntity {
        val owner =
            domain.repository?.let { repositoryMapper.toEntity(it) }
                ?: RepositoryEntity(
                    iid = domain.repositoryId.value,
                    localPath = "",
                    project = ProjectEntity(iid = domain.repositoryId.value, name = "")
                )

        val entity =
            RemoteEntity(
                id = domain.id,
                iid = domain.iid.value,
                name = domain.name,
                url = domain.url,
                repository = owner
            )

        return entity
    }

    override fun toDomain(entity: RemoteEntity): Remote {
        val repoDomain = repositoryMapper.toDomain(entity.repository)
        val domain =
            Remote(
                name = entity.name,
                url = entity.url,
                repositoryId = repoDomain.iid,
                iid = Remote.Id(entity.iid)
            ).apply {
                id = entity.id
                repository = repoDomain
            }

        return domain
    }

    override fun toDomainList(entities: Iterable<RemoteEntity>): List<Remote> = entities.map { this.toDomain(it) }
}
