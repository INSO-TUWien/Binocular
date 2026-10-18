package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.*
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.enums.IssueAccountRole
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
@Controller
class IssueResolver(
    private val issueService: IssueInfrastructurePort,
    private val accountService: AccountInfrastructurePort,
    private val commitService: CommitInfrastructurePort,
    private val milestoneService: MilestoneInfrastructurePort,
    private val noteService: NoteInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(IssueResolver::class.java)

    /**
     * Resolves the accounts field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "accounts")
    fun accounts(issue: IssueDto): List<AccountDto> {
        logger.info("Resolving accounts for issue: ${issue.id}")
        val iids = issue.accountIds.map { Account.Id(Uuid.parse(it)) }
        return accountService.findByIids(iids).map { mapper.toDto(it) }
    }

    /**
     * Resolves the commits field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "commits")
    fun commits(issue: IssueDto): List<CommitDto> {
        logger.info("Resolving commits for issue: ${issue.id}")
        val iids = issue.commitIds.map { Commit.Id(Uuid.parse(it)) }
        return commitService.findByIids(iids).map { mapper.toDto(it) }
    }

    /**
     * Resolves the milestones field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "milestones")
    fun milestones(issue: IssueDto): List<MilestoneDto> {
        logger.info("Resolving milestones for issue: ${issue.id}")
        val iids = issue.milestoneIds.map { Milestone.Id(Uuid.parse(it)) }
        return milestoneService.findByIids(iids).map { mapper.toDto(it) }
    }

    /**
     * Resolves the notes field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "notes")
    fun notes(issue: IssueDto): List<NoteDto> {
        logger.info("Resolving notes for issue: ${issue.id}")
        val iids = issue.noteIds.map { Note.Id(Uuid.parse(it)) }
        return noteService.findByIids(iids).map { mapper.toDto(it) }
    }

    /**
     * Resolves the users field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "users")
    fun users(issue: IssueDto): List<UserDto> {
        val id = issue.id ?: return emptyList()
        logger.info("Resolving users for issue: $id")
        return issueService.findUsersByIssueId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the author field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "author")
    fun author(issue: IssueDto): AccountDto? {
        logger.info("Resolving author for issue: ${issue.id}")
        return issue.authorId?.let {
            accountService.findByIid(Account.Id(Uuid.parse(it)))?.let { mapper.toDto(it) }
        }
    }

    /**
     * Resolves the assignee field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "assignee")
    fun assignee(issue: IssueDto): AccountDto? {
        val id = issue.id ?: return null
        logger.info("Resolving assignee for issue: $id")
        return issueService.findAccountsByIssueId(id, IssueAccountRole.ASSIGNEE).firstOrNull()?.let { mapper.toDto(it) }
    }

    /**
     * Resolves the assignees field for an Issue in GraphQL.
     */
    @SchemaMapping(typeName = "Issue", field = "assignees")
    fun assignees(issue: IssueDto): List<AccountDto> {
        val id = issue.id ?: return emptyList()
        logger.info("Resolving assignees for issue: $id")
        return issueService.findAccountsByIssueId(id, IssueAccountRole.ASSIGNEES).map { mapper.toDto(it) }
    }
}
