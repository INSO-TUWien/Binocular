@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.core.service.exception.NotFoundException
import com.inso_world.binocular.infrastructure.sql.mapper.BranchMapper
import com.inso_world.binocular.infrastructure.sql.mapper.CommitMapper
import com.inso_world.binocular.infrastructure.sql.mapper.DeveloperMapper
import com.inso_world.binocular.infrastructure.sql.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.sql.mapper.RepositoryMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.CommitDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.DeveloperDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.RepositoryDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.model.Build
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Developer
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.FileOwnership
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Module
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.Stats
import com.inso_world.binocular.model.User
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import java.util.stream.Collectors
import kotlin.uuid.ExperimentalUuidApi

@OptIn(ExperimentalUuidApi::class)
@Service
@Validated
@Deprecated("Use domain aggregate `Repository`")
internal class CommitInfrastructurePortImpl
    @Autowired
    constructor(
        private val commitMapper: CommitMapper,
        private val commitDao: CommitDao,
        @Lazy private val developerDao: DeveloperDao,
        @Lazy private val repositoryDao: RepositoryDao,
    ) : AbstractInfrastructurePort<Commit, CommitEntity, Long>(Long::class),
        CommitInfrastructurePort {
        companion object {
            val logger by logger()
        }

        @Autowired
        @Lazy
        private lateinit var projectMapper: ProjectMapper

        @Autowired
        @Lazy
        private lateinit var branchMapper: BranchMapper

        @Autowired
        @Lazy
        private lateinit var repositoryMapper: RepositoryMapper

        @Autowired
        @Lazy
        private lateinit var developerMapper: DeveloperMapper

        @Autowired
        @Lazy
        private lateinit var repositoryInfrastructurePort: RepositoryInfrastructurePortImpl

        @PostConstruct
        fun init() {
            super.dao = commitDao
        }

        override fun findByIid(iid: Commit.Id): @Valid Commit? {
            val entity = commitDao.findByIid(iid) ?: return null
            return commitMapper.toDomain(entity)
        }

        override fun findByIids(iids: Collection<Commit.Id>): List<@Valid Commit> {
            val entities = commitDao.findAllByIidIn(iids)
            return commitMapper.toDomainList(entities)
        }

        @Transactional
        override fun create(value: Commit): Commit {
            val repositoryEntity =
                repositoryDao.findByIid(value.repositoryId.value)
                    ?: throw NotFoundException("Repository ${value.repositoryId} not found")

            val author = resolveDeveloperEntity(value.authorSignature.developerId)
            val committer = resolveDeveloperEntity(value.committerSignature.developerId)

            val mapped = commitMapper.toEntity(value, repositoryEntity, author, committer)
            return this.commitDao.create(mapped).let { commitEntity ->
                commitMapper.refreshDomain(value, commitEntity)
            }
        }

        @Transactional
        override fun update(value: Commit): Commit {
            val repositoryEntity =
                repositoryDao.findByIid(value.repositoryId.value)
                    ?: throw NotFoundException("Repository ${value.repositoryId} not found")

            val author = resolveDeveloperEntity(value.authorSignature.developerId)
            val committer = resolveDeveloperEntity(value.committerSignature.developerId)

            val mapped = commitMapper.toEntity(value, repositoryEntity, author, committer)
            return this.commitDao.update(mapped).let { commitEntity ->
                commitMapper.refreshDomain(value, commitEntity)
            }
        }

        private fun resolveDeveloperEntity(developerId: Developer.Id): DeveloperEntity =
            developerDao.findByIid(developerId)
                ?: throw NotFoundException("Developer $developerId not found")

        override fun saveAll(values: Collection<Commit>): Iterable<Commit> = values.map { create(it) }

        override fun delete(value: Commit) {
            val entity =
                commitDao.findByIid(value.iid)
                    ?: throw NotFoundException("Commit ${value.iid} not found")
            this.commitDao.delete(entity)
        }

        override fun deleteById(id: String) {
            TODO("Not yet implemented")
        }

        override fun deleteAll() {
            this.commitDao.deleteAll()
        }

        override fun findAll(pageable: Pageable): Page<Commit> {
            val page = super.findAllEntities(pageable)
            val content = page.content.map { commitMapper.toDomain(it) }
            return Page(content, page.totalElements, pageable)
        }

        override fun findAll(
            pageable: Pageable,
            since: Long?,
            until: Long?,
        ): Page<Commit> {
            TODO("Not yet implemented")
        }

        override fun findBuildsByCommitId(commitId: String): List<Build> {
            TODO("Not yet implemented")
        }

        override fun findFilesByCommitId(commitId: String): List<File> {
            TODO("Not yet implemented")
        }

        override fun findFilesByCommitId(
            commitId: String,
            pageable: Pageable,
        ): Page<File> {
            TODO("Not yet implemented")
        }

        override fun findModulesByCommitId(commitId: String): List<Module> {
            TODO("Not yet implemented")
        }

        override fun findUsersByCommitId(commitId: String): List<User> {
            TODO("Not yet implemented")
        }

        override fun findIssuesByCommitId(commitId: String): List<Issue> {
            TODO("Not yet implemented")
        }

        override fun findCommitStatsByCommitId(commitId: String): Stats {
            TODO("Not yet implemented")
        }

        override fun findFileStatsByCommitId(commitId: String): Map<String, Stats> {
            TODO("Not yet implemented")
        }

        override fun findFileActionsByCommitId(commitId: String): Map<String, String?> {
            TODO("Not yet implemented")
        }

        override fun findFileOwnershipByCommitAndFile(
            commitId: String,
            fileId: String,
        ): List<FileOwnership> {
            TODO("Not yet implemented")
        }

        override fun findParentCommitsByChildCommitId(childCommitId: String): List<Commit> {
            TODO("Not yet implemented")
        }

        override fun findChildCommitsByParentCommitId(parentCommitId: String): List<Commit> {
            TODO("Not yet implemented")
        }

        @Transactional(readOnly = true)
        override fun findExistingSha(
            repo: Repository,
            shas: List<String>,
        ): Iterable<Commit> = repositoryInfrastructurePort.findExistingCommits(repo, shas.toSet()).toSet()

        override fun findAll(
            repo: Repository,
            pageable: Pageable,
        ): Iterable<Commit> = this.findAll(repo)

        @Transactional(readOnly = true)
        override fun findAll(): Iterable<Commit> {
            val commits = this.commitDao.findAll()
            return commits.map { this.commitMapper.toDomain(it) }
        }

        @Transactional(readOnly = true)
        override fun findAll(repository: Repository): Iterable<Commit> =
            this.commitDao.findAll(repository).collect(Collectors.toSet()).map {
                return@map this.commitMapper.toDomain(it)
            }

        @Transactional(readOnly = true)
        override fun findHeadForBranch(
            repo: Repository,
            branch: String,
        ): Commit? =
            this.repositoryDao
                .findByIid(repo.iid.value)
                ?.let {
                    this.commitDao.findHeadForBranch(it, branch)
                }?.toDomain()

        @Transactional(readOnly = true)
        override fun findAllLeafCommits(repo: Repository): Iterable<Commit> =
            this.repositoryDao
                .findByIid(repo.iid.value)
                ?.let {
                    this.commitDao.findAllLeafCommits(it)
                }?.map { it.toDomain() } ?: emptyList()
    }
