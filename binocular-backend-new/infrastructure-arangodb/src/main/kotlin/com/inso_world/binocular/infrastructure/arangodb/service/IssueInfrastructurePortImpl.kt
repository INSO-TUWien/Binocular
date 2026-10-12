package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.IssueInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueCommitConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IIssueDao
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Project
import com.inso_world.binocular.model.User
import com.inso_world.binocular.model.enums.IssueAccountRole
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class IssueInfrastructurePortImpl :
    IssueInfrastructurePort,
    AbstractInfrastructurePort<Issue, String>() {

    @PostConstruct
    fun init() {
        super.dao = issueDao
    }
    @Autowired
    private lateinit var issueDao: IIssueDao

    @Autowired
    private lateinit var issueAccountConnectionRepository: IIssueAccountConnectionDao

    @Autowired
    private lateinit var issueCommitConnectionRepository: IIssueCommitConnectionDao

    @Autowired
    private lateinit var issueMilestoneConnectionRepository: IIssueMilestoneConnectionDao

    @Autowired
    private lateinit var issueNoteConnectionRepository: IIssueNoteConnectionDao

    @Autowired
    private lateinit var issueUserConnectionRepository: IIssueUserConnectionDao
    var logger: Logger = LoggerFactory.getLogger(IssueInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<Issue> {
        logger.trace("Getting all issues with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return issueDao.findAll(pageable)
    }

    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?,
    ): Page<Issue> {
        logger.trace(
            "Getting issues with pageable: page={}, size={}, since={}, until={}",
            pageable.pageNumber,
            pageable.pageSize,
            since,
            until
        )
        return issueDao.findAll(pageable, since, until)
    }

    override fun findById(id: String): Issue? {
        logger.trace("Getting issue by id: $id")
        return issueDao.findById(id)
    }

    override fun findByIid(iid: Issue.Id): @Valid Issue? {
        logger.trace("Getting issue by iid: $iid")
        return issueDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Issue.Id>): List<@Valid Issue> {
        logger.trace("Getting issues by iids: $iids")
        return issueDao.findAll().filter { it.iid in iids }
    }

    override fun findAccountsByIssueId(issueId: String): List<Account> {
        logger.trace("Getting accounts for issue: $issueId")
        return issueAccountConnectionRepository.findAccountsByIssue(issueId)
    }

    override fun findAccountsByIssueId(
        issueId: String,
        role: IssueAccountRole,
    ): List<Account> {
        logger.trace("Getting accounts for issue: $issueId with role: ${'$'}role")
        return issueAccountConnectionRepository.findAccountsByIssue(issueId, role)
    }

    override fun findCommitsByIssueId(issueId: String): List<Commit> {
        logger.trace("Getting commits for issue: $issueId")
        return issueCommitConnectionRepository.findCommitsByIssue(issueId)
    }

    override fun findMilestonesByIssueId(issueId: String): List<Milestone> {
        logger.trace("Getting milestones for issue: $issueId")
        return issueMilestoneConnectionRepository.findMilestonesByIssue(issueId)
    }

    override fun findNotesByIssueId(issueId: String): List<Note> {
        logger.trace("Getting notes for issue: $issueId")
        return issueNoteConnectionRepository.findNotesByIssue(issueId)
    }

    override fun findUsersByIssueId(issueId: String): List<User> {
        logger.trace("Getting users for issue: $issueId")
        return issueUserConnectionRepository.findUsersByIssue(issueId)
    }

    override fun findExistingGid(
        ids: List<String>,
        project: Project
    ): Iterable<Issue> {
        TODO("Not yet implemented")
    }

    override fun findAll(): Iterable<Issue> = this.issueDao.findAll()

    override fun create(entity: Issue): Issue = this.issueDao.save(entity)

    override fun saveAll(entities: Collection<Issue>): Iterable<Issue> = this.issueDao.saveAll(entities)

    override fun delete(entity: Issue) = this.issueDao.delete(entity)

    override fun update(entity: Issue): Issue {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.issueDao.deleteAll()
    }
}
