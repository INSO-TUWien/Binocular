@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb

import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.ICommitDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.CommitMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.CommitRepository
import com.inso_world.binocular.model.Commit
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of ICommitDao using the MappedArangoDbDao approach.
 *
 * This class extends MappedArangoDbDao to leverage the entity mapping pattern,
 * which provides a clean separation between domain models (Commit) and
 * database-specific entities (CommitEntity).
 */
@Repository
internal class CommitDao(
    @Autowired private val commitRepository: CommitRepository,
    @Autowired private val commitMapper: CommitMapper,
    @Autowired private val repositoryRepository: com.inso_world.binocular.infrastructure.arangodb.persistence.repository.RepositoryRepository,
    @Autowired private val developerRepository: com.inso_world.binocular.infrastructure.arangodb.persistence.repository.DeveloperRepository,
) : MappedArangoDbDao<Commit, CommitEntity, String>(commitRepository, commitMapper),
    ICommitDao {

    override fun create(entity: Commit): Commit {
        val owner = repositoryRepository.findByIid(entity.repositoryId.value)
            ?: throw IllegalStateException("Repository not found: ${entity.repositoryId.value}")
        val author = developerRepository.findByIid(entity.authorSignature.developerId.value)
            ?: throw IllegalStateException("Author not found: ${entity.authorSignature.developerId.value}")
        val committer = developerRepository.findByIid(entity.committerSignature.developerId.value)
            ?: throw IllegalStateException("Committer not found: ${entity.committerSignature.developerId.value}")

        val mappedEntity = commitMapper.toEntity(entity, owner, author, committer)
        val savedEntity = commitRepository.save(mappedEntity)
        commitMapper.refreshDomain(entity, savedEntity)
        return commitMapper.toDomain(savedEntity)
    }

    override fun update(entity: Commit): Commit = create(entity)

    fun findByRepositoryAndShaIn(repoPath: String, shas: Collection<String>): Iterable<Commit> {
        return commitRepository.findByRepositoryAndShaIn(repoPath, shas).map { commitMapper.toDomain(it) }
    }
}
