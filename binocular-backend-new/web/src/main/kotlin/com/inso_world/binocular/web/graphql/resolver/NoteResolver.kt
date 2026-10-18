package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
class NoteResolver(
    private val noteService: NoteInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(NoteResolver::class.java)

    /**
     * Resolves the accounts field for a Note in GraphQL.
     *
     * This method retrieves all accounts associated with the given note.
     * If the note ID is null, an empty list is returned.
     *
     * @param note The note for which to retrieve accounts
     * @return A list of accounts associated with the note, or an empty list if the note ID is null
     */
    @SchemaMapping(typeName = "Note", field = "accounts")
    fun accounts(note: NoteDto): List<AccountDto> {
        val id = note.id ?: return emptyList()
        logger.info("Resolving accounts for note: $id")
        // Get all connections for this note and extract the accounts
        return noteService.findAccountsByNoteId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the issues field for a Note in GraphQL.
     *
     * This method retrieves all issues associated with the given note.
     * If the note ID is null, an empty list is returned.
     *
     * @param note The note for which to retrieve issues
     * @return A list of issues associated with the note, or an empty list if the note ID is null
     */
    @SchemaMapping(typeName = "Note", field = "issues")
    fun issues(note: NoteDto): List<IssueDto> {
        val id = note.id ?: return emptyList()
        logger.info("Resolving issues for note: $id")
        // Get all connections for this note and extract the issues
        return noteService.findIssuesByNoteId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the mergeRequests field for a Note in GraphQL.
     *
     * This method retrieves all merge requests associated with the given note.
     * If the note ID is null, an empty list is returned.
     *
     * @param note The note for which to retrieve merge requests
     * @return A list of merge requests associated with the note, or an empty list if the note ID is null
     */
    @SchemaMapping(typeName = "Note", field = "mergeRequests")
    fun mergeRequests(note: NoteDto): List<MergeRequestDto> {
        val id = note.id ?: return emptyList()
        logger.info("Resolving merge requests for note: $id")
        // Get all connections for this note and extract the merge requests
        return noteService.findMergeRequestsByNoteId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the author field for a Note in GraphQL.
     *
     * This method retrieves the author account associated with the given note.
     * If the note ID is null or no author is associated, null is returned.
     *
     * @param note The note for which to retrieve the author
     * @return The author account associated with the note, or null if none exists
     */
    @SchemaMapping(typeName = "Note", field = "author")
    fun author(note: NoteDto): AccountDto? {
        val id = note.id ?: return null
        logger.info("Resolving author for note: $id")
        // Get all authors for this note and return first as there is only one
        val accounts = noteService.findAccountsByNoteId(id)
        return accounts.firstOrNull()?.let { mapper.toDto(it) }
    }
}
