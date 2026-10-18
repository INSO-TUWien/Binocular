@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RevisionEntity
import com.inso_world.binocular.model.Revision
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Mapper for Revision domain objects.
 */
@Component
internal class RevisionMapper : EntityMapper<Revision, RevisionEntity> {
    @Autowired
    @Lazy
    private lateinit var fileMapper: FileMapper

    @Autowired
    @Lazy
    private lateinit var commitMapper: CommitMapper

    override fun toEntity(domain: Revision): RevisionEntity {
        // TODO
        throw UnsupportedOperationException("RevisionMapper.toEntity needs entities to be resolved externally")
    }

    override fun toDomain(entity: RevisionEntity): Revision {
        val domain =
            Revision(
                content = entity.content ?: "",
                commitSha = entity.commit.sha,
                filePath = entity.file.path,
                iid = Revision.Id(entity.iid)
            ).apply {
                id = entity.id
            }

        return domain
    }

    override fun toDomainList(entities: Iterable<RevisionEntity>): List<Revision> = entities.map { it -> this.toDomain(it) }
}
