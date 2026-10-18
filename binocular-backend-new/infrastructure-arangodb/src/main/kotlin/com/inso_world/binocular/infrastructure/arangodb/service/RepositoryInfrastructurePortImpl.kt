@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.RepositoryInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.BranchDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.CommitDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.RepositoryDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.RepositoryMapper
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Repository
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class RepositoryInfrastructurePortImpl :
    AbstractInfrastructurePort<Repository, String>(),
    RepositoryInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = repositoryDao
    }

    companion object {
        val logger by logger()
    }

    @Autowired
    private lateinit var commitDao: CommitDao

    @Autowired
    private lateinit var repositoryDao: RepositoryDao

    @Autowired
    private lateinit var repositoryMapper: RepositoryMapper

    @Autowired
    private lateinit var branchDao: BranchDao

    override fun findByIid(iid: Repository.Id): Repository? {
        logger.trace("Getting repository by iid: $iid")
        return this.repositoryDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Repository.Id>): List<Repository> {
        logger.trace("Getting repositories by iids: $iids")
        return repositoryDao.findAll().filter { it.iid in iids }
    }

    override fun findAll(): Iterable<Repository> = this.repositoryDao.findAll()

    override fun findAll(pageable: Pageable): Page<Repository> = this.repositoryDao.findAll(pageable)

    override fun findById(id: String): Repository? = this.repositoryDao.findById(id)

    override fun create(value: Repository): Repository {
        // DAO expects Repository domain model and handles mapping
        return this.repositoryDao.create(value)
    }

    override fun saveAll(values: Collection<Repository>): Iterable<Repository> = this.repositoryDao.saveAll(values)

    override fun update(value: Repository): Repository = this.repositoryDao.save(value)

    override fun findByName(name: String): Repository? = this.repositoryDao.findByName(name)?.let { this.repositoryMapper.toDomain(it) }

    override fun findExistingCommits(
        repo: Repository,
        shas: Set<String>,
    ): Sequence<Commit> = commitDao.findByRepositoryAndShaIn(repo.localPath, shas).asSequence()

    override fun findBranch(
        repository: Repository,
        name: String,
    ): Branch? = branchDao.findByRepositoryAndName(repository.localPath, name)
}
