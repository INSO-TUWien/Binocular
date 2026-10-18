package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.CommitInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.ICommitBuildConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.ICommitCommitConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitModuleConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueCommitConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.ICommitDao
import com.inso_world.binocular.model.Build
import com.inso_world.binocular.model.Commit
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
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.ZoneOffset

@Service
internal class CommitInfrastructurePortImpl :
    AbstractInfrastructurePort<Commit, String>(),
    CommitInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = commitDao
    }

    @Autowired private lateinit var commitDao: ICommitDao

    @Autowired private lateinit var commitBuildConnectionRepository: ICommitBuildConnectionDao

    @Autowired private lateinit var commitCommitConnectionRepository: ICommitCommitConnectionDao

    @Autowired private lateinit var commitFileConnectionRepository: ICommitFileConnectionDao

    @Autowired private lateinit var commitModuleConnectionRepository: ICommitModuleConnectionDao

    @Autowired private lateinit var issueCommitConnectionRepository: IIssueCommitConnectionDao

    @Autowired private lateinit var commitUserConnectionRepository: ICommitUserConnectionDao

    companion object {
        private val logger by logger()
    }

    override fun findAll(pageable: Pageable): Page<Commit> {
        logger.trace("Getting all commits with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return commitDao.findAll(pageable)
    }

    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?,
    ): Page<Commit> {
        logger.trace(
            "Getting commits with pageable: page={}, size={}, since={}, until={}",
            pageable.pageNumber,
            pageable.pageSize,
            since,
            until,
        )

        if (since == null && until == null) {
            return findAll(pageable)
        }

        return findCommitsInternal(
            pageable = pageable,
            since = since,
            until = until,
        )
    }

    override fun findById(id: String): Commit? {
        logger.trace("Getting commit by id: $id")
        return commitDao.findById(id)
    }

    override fun findByIid(iid: Commit.Id): @Valid Commit? {
        logger.trace("Getting commit by iid: $iid")
        return commitDao.findByIid(iid)
    }

    override fun findByIids(iids: Collection<Commit.Id>): List<@Valid Commit> {
        logger.trace("Getting commits by iids: $iids")
        return commitDao.findByIids(iids.toList())
    }

    override fun findBuildsByCommitId(commitId: String): List<Build> {
        logger.trace("Getting builds for commit: $commitId")
        return commitBuildConnectionRepository.findBuildsByCommit(commitId)
    }

    override fun findFilesByCommitId(commitId: String): List<File> {
        logger.trace("Getting files for commit: $commitId")
        return commitFileConnectionRepository.findFilesByCommit(commitId)
    }

    override fun findFilesByCommitId(
        commitId: String,
        pageable: Pageable,
    ): Page<File> {
        logger.trace("Getting files for commit: $commitId with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return commitFileConnectionRepository.findFilesByCommitPaged(commitId, pageable)
    }

    override fun findModulesByCommitId(commitId: String): List<Module> {
        logger.trace("Getting modules for commit: $commitId")
        return commitModuleConnectionRepository.findModulesByCommit(commitId)
    }

    override fun findCommitStatsByCommitId(commitId: String): Stats {
        logger.trace("Getting stats for commit: $commitId")
        return commitFileConnectionRepository.findCommitStatsByCommit(commitId)
    }

    override fun findFileStatsByCommitId(commitId: String): Map<String, Stats> {
        logger.trace("Getting per-file stats for commit: $commitId")
        return commitFileConnectionRepository.findFileStatsByCommit(commitId)
    }

    override fun findFileActionsByCommitId(commitId: String): Map<String, String?> {
        logger.trace("Getting per-file actions for commit: $commitId")
        return commitFileConnectionRepository.findFileActionsByCommit(commitId)
    }

    override fun findUsersByCommitId(commitId: String): List<User> {
        logger.trace("Getting users for commit: $commitId")
        return commitUserConnectionRepository.findUsersByCommit(commitId)
    }

    override fun findFileOwnershipByCommitAndFile(
        commitId: String,
        fileId: String,
    ): List<FileOwnership> {
        logger.trace("Getting ownership for commit: $commitId and file: $fileId")
        return commitFileConnectionRepository.findFileOwnershipByCommitAndFile(commitId, fileId)
    }

    override fun findIssuesByCommitId(commitId: String): List<Issue> {
        logger.trace("Getting issues for commit: $commitId")
        return issueCommitConnectionRepository.findIssuesByCommit(commitId)
    }

    override fun findParentCommitsByChildCommitId(childCommitId: String): List<Commit> {
        logger.trace("Getting parent commits for child commit: $childCommitId")
        return commitCommitConnectionRepository.findParentCommits(childCommitId)
    }

    override fun findChildCommitsByParentCommitId(parentCommitId: String): List<Commit> {
        logger.trace("Getting child commits for parent commit: $parentCommitId")
        return commitCommitConnectionRepository.findChildCommits(parentCommitId)
    }

    override fun findAll(): Iterable<Commit> = this.commitDao.findAll()

    override fun create(entity: Commit): Commit = this.commitDao.create(entity)

    override fun saveAll(entities: Collection<Commit>): Iterable<Commit> = entities.map { create(it) }

    override fun update(entity: Commit): Commit = this.commitDao.update(entity)

    override fun findExistingSha(
        repo: Repository,
        shas: List<String>,
    ): Set<Commit> {
        TODO("Not yet implemented")
    }

    override fun findAll(
        repo: Repository,
        pageable: Pageable,
    ): Iterable<Commit> {
        TODO("Not yet implemented")
    }

    override fun findHeadForBranch(
        repo: Repository,
        branch: String,
    ): Commit? {
        TODO("Not yet implemented")
    }

    override fun findAllLeafCommits(repo: Repository): Iterable<Commit> {
        TODO("Not yet implemented")
    }

    override fun findAll(repo: Repository): Iterable<Commit> {
        TODO("Not yet implemented")
    }

    // TODO: do in db, same as for commit controller
    private fun findCommitsInternal(
        pageable: Pageable,
        since: Long?,
        until: Long?,
    ): Page<Commit> {
        fun Commit.commitMillis() = commitDateTime?.toInstant(ZoneOffset.UTC)?.toEpochMilli()

        val comparatorAsc: Comparator<Commit> =
            compareBy(
                { it.commitMillis() },
                { it.sha }
            )

        val filteredAndSorted =
            commitDao
                .findAll()
                .asSequence()
                .filter { commit ->
                    val ts = commit.commitMillis() ?: return@filter true
                    (since == null || ts >= since) &&
                        (until == null || ts <= until)
                }.sortedWith(comparatorAsc)
                .toList()

        val from =
            (pageable.pageNumber * pageable.pageSize)
                .coerceAtMost(filteredAndSorted.size)
        val to =
            (from + pageable.pageSize)
                .coerceAtMost(filteredAndSorted.size)

        return Page(
            content = filteredAndSorted.subList(from, to),
            totalElements = filteredAndSorted.size.toLong(),
            pageable = pageable
        )
    }
}
