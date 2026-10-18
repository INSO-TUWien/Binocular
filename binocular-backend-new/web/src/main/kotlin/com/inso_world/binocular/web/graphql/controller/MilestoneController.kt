package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.MilestoneInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.MilestoneDto
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
@SchemaMapping(typeName = "Milestone")
internal class MilestoneController(
    @Autowired private val milestoneService: MilestoneInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(MilestoneController::class.java)

    /**
     * Find all milestones with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the milestones and pagination metadata.
     */
    @QueryMapping(name = "milestones")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<MilestoneDto> {
        logger.info("Getting all milestones...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.DESC,
                sortBy = "dueDate",
            )

        logger.debug(
            "Getting all milestones with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = milestoneService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a milestone by its ID.
     *
     * This method retrieves a single milestone based on the provided ID.
     * If no milestone is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the milestone to retrieve.
     * @return The milestone with the specified ID.
     * @throws GraphQLException if no milestone is found with the given ID.
     */
    @QueryMapping(name = "milestone")
    fun findById(
        @Argument id: String,
    ): MilestoneDto {
        logger.info("Getting milestone by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(milestoneService.findById(id), "Milestone", id))
    }
}
