package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IBranchDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.BranchEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.BranchRepository
import com.inso_world.binocular.model.Branch
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IBranchDao using the MappedArangoDbDao approach.
 *
 * This class extends MappedArangoDbDao to leverage the entity mapping pattern,
 * which provides a clean separation between domain models (Branch) and
 * database-specific entities (BranchEntity).
 */

@Repository
internal class BranchDao(
    @Autowired private val branchRepository: BranchRepository,
    @Autowired private val branchMapper: BranchMapper,
    @Autowired private val repositoryRepository:
        com.inso_world.binocular.infrastructure.arangodb.persistence.repository.RepositoryRepository,
    @Autowired private val commitRepository: com.inso_world.binocular.infrastructure.arangodb.persistence.repository.CommitRepository,
) : MappedArangoDbDao<Branch, BranchEntity, String>(branchRepository, branchMapper),
    IBranchDao {
    override fun findByName(name: String): Branch? = null

    fun findByRepositoryAndName(
        repoPath: String,
        name: String
    ): Branch? = branchRepository.findByRepositoryAndName(repoPath, name)?.let { branchMapper.toDomain(it) }

    override fun create(entity: Branch): Branch {
        val owner =
            repositoryRepository.findByIid(entity.repositoryId.value)
                ?: throw IllegalStateException("Repository not found: ${entity.repositoryId.value}")
        val head =
            commitRepository.findByRepository_IidAndSha(entity.repositoryId.value, entity.headSha)
                ?: throw IllegalStateException("Head commit not found: ${entity.headSha} in repository ${entity.repositoryId.value}")

        val mappedEntity = branchMapper.toEntity(entity, owner, head)
        val savedEntity = branchRepository.save(mappedEntity)
        branchMapper.refreshDomain(entity, savedEntity)
        return branchMapper.toDomain(savedEntity)
    }

    override fun update(entity: Branch): Branch = create(entity)

    override fun findAll(pageable: Pageable): Page<Branch> {
        val offset = pageable.offset.toInt()
        val limit = pageable.pageSize
        val firstOrder = pageable.sort.firstOrNull()
        val asc = firstOrder?.direction == Sort.Direction.ASC

        val entities =
            if (asc) {
                branchRepository.findAllSortedAsc(offset, limit)
            } else {
                branchRepository.findAllSortedDesc(offset, limit)
            }
        val content = entities.map { branchMapper.toDomain(it) }
        val total = repository.count()
        return Page(content, total, pageable)
    }
}
