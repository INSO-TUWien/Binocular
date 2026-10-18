package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IBuildDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BuildEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.BuildMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.BuildRepository
import com.inso_world.binocular.model.Build
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IBuildDao using the MappedArangoDbDao approach.
 *
 * This class extends MappedArangoDbDao to leverage the entity mapping pattern,
 * which provides a clean separation between domain models (Build) and
 * database-specific entities (BuildEntity).
 */

@Repository
internal class BuildDao(
    @Autowired private val buildRepository: BuildRepository,
    @Autowired private val buildMapper: BuildMapper,
) : MappedArangoDbDao<Build, BuildEntity, String>(buildRepository, buildMapper),
    IBuildDao {
    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?
    ): Page<Build> {
        if (since == null && until == null) {
            return super.findAll(pageable)
        }
        val offset = pageable.offset.toInt()
        val size = pageable.pageSize
        val firstOrder = pageable.sort.firstOrNull()
        val asc = firstOrder?.direction == Sort.Direction.ASC

        val entities =
            when {
                since != null && until != null ->
                    if (asc) {
                        buildRepository.findAllBetweenAsc(offset, size, since, until)
                    } else {
                        buildRepository.findAllBetweenDesc(offset, size, since, until)
                    }
                since != null ->
                    if (asc) {
                        buildRepository.findAllSinceAsc(offset, size, since)
                    } else {
                        buildRepository.findAllSinceDesc(offset, size, since)
                    }
                else ->
                    if (asc) {
                        buildRepository.findAllUntilAsc(offset, size, until!!)
                    } else {
                        buildRepository.findAllUntilDesc(offset, size, until!!)
                    }
            }
        val content = entities.map { buildMapper.toDomain(it) }
        val total =
            when {
                since != null && until != null -> buildRepository.countAllBetween(since, until)
                since != null -> buildRepository.countAllSince(since)
                else -> buildRepository.countAllUntil(until!!)
            }
        return Page(content, total, pageable)
    }
}
