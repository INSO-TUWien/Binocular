package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.MergeRequestInfrastructurePort
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
class MergeRequestResolver(
    private val mergeRequestService: MergeRequestInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(MergeRequestResolver::class.java)

    /**
     * Resolves the accounts field for a MergeRequest in GraphQL.
     *
     * This method retrieves all accounts associated with the given merge request.
     * If the merge request ID is null, an empty list is returned.
     *
     * @param mergeRequest The merge request for which to retrieve accounts
     * @return A list of accounts associated with the merge request, or an empty list if the merge request ID is null
     */
    @SchemaMapping(typeName = "mergeRequest", field = "accounts")
    fun accounts(mergeRequest: MergeRequestDto): List<AccountDto> {
        val id = mergeRequest.id ?: return emptyList()
        logger.info("Resolving accounts for merge request: $id")
        // Get all connections for this merge request and extract the accounts
        return mergeRequestService.findAccountsByMergeRequestId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the milestones field for a MergeRequest in GraphQL.
     *
     * This method retrieves all milestones associated with the given merge request.
     * If the merge request ID is null, an empty list is returned.
     *
     * @param mergeRequest The merge request for which to retrieve milestones
     * @return A list of milestones associated with the merge request, or an empty list if the merge request ID is null
     */
    @SchemaMapping(typeName = "mergeRequest", field = "milestones")
    fun milestones(mergeRequest: MergeRequestDto): List<MilestoneDto> {
        val id = mergeRequest.id ?: return emptyList()
        logger.info("Resolving milestones for merge request: $id")
        // Get all connections for this merge request and extract the milestones
        return mergeRequestService.findMilestonesByMergeRequestId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the notes field for a MergeRequest in GraphQL.
     *
     * This method retrieves all notes associated with the given merge request.
     * If the merge request ID is null, an empty list is returned.
     *
     * @param mergeRequest The merge request for which to retrieve notes
     * @return A list of notes associated with the merge request, or an empty list if the merge request ID is null
     */
    @SchemaMapping(typeName = "mergeRequest", field = "notes")
    fun notes(mergeRequest: MergeRequestDto): List<NoteDto> {
        val id = mergeRequest.id ?: return emptyList()
        logger.info("Resolving notes for merge request: $id")
        // Get all connections for this merge request and extract the notes
        return mergeRequestService.findNotesByMergeRequestId(id).map { mapper.toDto(it) }
    }

    @SchemaMapping(typeName = "mergeRequest", field = "author")
    fun author(mergeRequest: MergeRequestDto): AccountDto? {
        val id = mergeRequest.id ?: return null
        logger.info("Resolving author for merge request: $id")
        val accounts = mergeRequestService.findAccountsByMergeRequestId(id)
        return accounts.firstOrNull()?.let { mapper.toDto(it) }
    }

    @SchemaMapping(typeName = "mergeRequest", field = "assignee")
    fun assignee(mergeRequest: MergeRequestDto): AccountDto? {
        val id = mergeRequest.id ?: return null
        logger.info("Resolving assignee for merge request: $id")
        val accounts = mergeRequestService.findAccountsByMergeRequestId(id)
        return if (accounts.size >= 2) mapper.toDto(accounts[1]) else null
    }

    @SchemaMapping(typeName = "mergeRequest", field = "assignees")
    fun assignees(mergeRequest: MergeRequestDto): List<AccountDto> {
        val id = mergeRequest.id ?: return emptyList()
        logger.info("Resolving assignees for merge request: $id")
        val accounts = mergeRequestService.findAccountsByMergeRequestId(id)
        return if (accounts.size <= 1) emptyList() else accounts.drop(1).map { mapper.toDto(it) }
    }

    // TODO: this is missing in the db idk
    @SchemaMapping(typeName = "mergeRequest", field = "sourceBranch")
    fun sourceBranch(
        @Suppress("UNUSED_PARAMETER") mergeRequest: MergeRequestDto
    ): String? = null

    // TODO: same here?
    @SchemaMapping(typeName = "mergeRequest", field = "targetBranch")
    fun targetBranch(
        @Suppress("UNUSED_PARAMETER") mergeRequest: MergeRequestDto
    ): String? = null
}
