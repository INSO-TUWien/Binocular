package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.IssueInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.mapper.IssueMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.IssueDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.IssueLinkDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.NoteDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.ProjectDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.model.*
import com.inso_world.binocular.model.enums.IssueAccountRole
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import kotlin.uuid.Uuid

@Service
@Profile("postgres")
@Validated
internal class IssueInfrastructurePortImpl
    @Autowired
    constructor(
        private val projectDao: ProjectDao,
        private val issueDao: IssueDao,
        private val issueMapper: IssueMapper,
        private val linkDao: IssueLinkDao,
        private val noteDao: NoteDao,
    ) : AbstractInfrastructurePort<Issue, IssueEntity, Long>(Long::class),
        IssueInfrastructurePort {
        companion object {
            private val logger by logger()
        }

        override fun findAccountsByIssueId(issueId: String): List<Account> = emptyList()

        override fun findCommitsByIssueId(issueId: String): List<Commit> = emptyList()

        override fun findAccountsByIssueId(
            issueId: String,
            role: IssueAccountRole
        ): List<Account> = emptyList()

        override fun findMilestonesByIssueId(issueId: String): List<Milestone> = emptyList()

        override fun findNotesByIssueId(issueId: String): List<Note> = emptyList()

        override fun findUsersByIssueId(issueId: String): List<User> = emptyList()

        override fun findAll(): Iterable<Issue> = super.findAllEntities().map { issueMapper.toDomain(it) }

        @Transactional(readOnly = true)
        override fun findByIid(iid: Issue.Id): Issue? {
            val entity = issueDao.findByIid(iid) ?: return null
            return issueMapper.toDomain(entity)
        }

        @Transactional(readOnly = true)
        override fun findByIids(iids: Collection<Issue.Id>): List<Issue> {
            val entities = issueDao.findAllByIidIn(iids)
            return entities.map { issueMapper.toDomain(it) }
        }

        @Transactional(readOnly = true)
        override fun findExistingGid(
            ids: List<String>,
            project: Project
        ): Iterable<Issue> =
            this.issueDao
                .findExistingGid(project, ids)
                .map { this.issueMapper.toDomain(it) }

        override fun findById(id: String): Issue? {
            val entity = issueDao.findByIid(Issue.Id(Uuid.parse(id))) ?: return null
            return issueMapper.toDomain(entity)
        }

        override fun update(value: Issue): Issue {
            val owner =
                projectDao.findByIid(value.project)
                    ?: throw IllegalStateException("Project not found")
            val entity = issueMapper.toEntity(value, owner)
            return issueMapper.toDomain(issueDao.update(entity))
        }

        override fun create(value: Issue): Issue {
            val owner =
                projectDao.findByIid(value.project)
                    ?: throw IllegalStateException("Project not found")
            val entity = issueMapper.toEntity(value, owner)
            return issueMapper.toDomain(issueDao.create(entity))
        }

        override fun saveAll(values: Collection<Issue>): Iterable<Issue> = values.map { update(it) }

        override fun delete(value: Issue) {
            value.id?.let { deleteById(it) }
        }

        override fun findAll(pageable: Pageable): Page<Issue> {
            val page = super.findAllEntities(pageable)
            val content = page.content.map { issueMapper.toDomain(it) }
            return Page(content, page.totalElements, pageable)
        }

        override fun findAll(
            pageable: Pageable,
            since: Long?,
            until: Long?
        ): Page<Issue> = findAll(pageable)

        override fun deleteById(id: String) {
            linkDao.deleteLinksByIssueId(id)
            issueDao.deleteById(id.toLong())
        }

        override fun deleteAll() {
            linkDao.deleteAllLinks()
            issueDao.deleteAll()
        }
    }
