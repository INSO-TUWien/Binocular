package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.NoteDto
import com.inso_world.binocular.web.graphql.model.PageDto
import com.inso_world.binocular.web.graphql.model.Sort
import com.inso_world.binocular.web.util.PaginationUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
@SchemaMapping(typeName = "Note")
internal class NoteController(
    @Autowired private val noteService: NoteInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(NoteController::class.java)

    /**
     * Find all notes with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the notes and pagination metadata.
     */
    @QueryMapping(name = "notes")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<NoteDto> {
        logger.info("Getting all notes...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.DESC,
                sortBy = "createdAt",
            )

        logger.debug(
            "Getting all notes with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = noteService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a note by its ID.
     *
     * Retrieves a single note using its unique identifier. If the note cannot be found,
     * a GraphQLException is thrown to signal a client error.
     *
     * @param id the unique identifier of the note
     * @return the matching Note
     * @throws graphql.GraphQLException if no note exists with the given ID
     */
    @QueryMapping(name = "note")
    fun findById(
        @Argument id: String,
    ): NoteDto {
        logger.info("Getting note by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(noteService.findById(id), "Note", id))
    }
}
