package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IIssueDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.IssueMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.IssueRepository
import com.inso_world.binocular.model.Issue
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IIssueDao using the MappedArangoDbDao approach.
 *
 * This class extends MappedArangoDbDao to leverage the entity mapping pattern,
 * which provides a clean separation between domain models (Issue) and
 * database-specific entities (IssueEntity).
 */

@Repository
internal class IssueDao(
    @Autowired private val issueRepository: IssueRepository,
    @Autowired private val issueMapper: IssueMapper,
) : MappedArangoDbDao<Issue, IssueEntity, String>(issueRepository, issueMapper),
    IIssueDao {
    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?
    ): Page<Issue> {
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
                        issueRepository.findAllBetweenAsc(offset, size, since, until)
                    } else {
                        issueRepository.findAllBetweenDesc(offset, size, since, until)
                    }
                since != null ->
                    if (asc) {
                        issueRepository.findAllSinceAsc(offset, size, since)
                    } else {
                        issueRepository.findAllSinceDesc(offset, size, since)
                    }
                else ->
                    if (asc) {
                        issueRepository.findAllUntilAsc(offset, size, until!!)
                    } else {
                        issueRepository.findAllUntilDesc(offset, size, until!!)
                    }
            }

        val content = entities.map { issueMapper.toDomain(it) }
        val total =
            when {
                since != null && until != null -> issueRepository.countAllBetween(since, until)
                since != null -> issueRepository.countAllSince(since)
                else -> issueRepository.countAllUntil(until!!)
            }
        return Page(content, total, pageable)
    }
}
