package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.IssueInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.IssueDto
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
@SchemaMapping(typeName = "Issue")
internal class IssueController(
    @Autowired private val issueService: IssueInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(IssueController::class.java)

    /**
     * Find all issues with pagination and optional time-range filtering.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param since Optional timestamp (epoch millis) to include only issues created at or after this moment.
     * @param until Optional timestamp (epoch millis) to include only issues created at or before this moment.
     * @param sort Optional sort direction (ASC|DESC). Defaults to ASC when not provided.
     * @return A Page object containing the issues and pagination metadata.
     */
    @QueryMapping(name = "issues")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument since: Long?,
        @Argument until: Long?,
        @Argument sort: Sort?,
    ): PageDto<IssueDto> {
        logger.info("Getting all issues with since=$since, until=$until")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.ASC,
                sortBy = "createdAt",
            )

        logger.debug(
            "Getting all issues with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = issueService.findAll(pageable, since, until)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find an issue by its ID.
     *
     * This method retrieves a single issue based on the provided ID.
     * If no issue is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the issue to retrieve.
     * @return The issue with the specified ID.
     * @throws GraphQLException if no issue is found with the given ID.
     */
    @QueryMapping(name = "issue")
    fun findById(
        @Argument id: String,
    ): IssueDto {
        logger.info("Getting issue by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(issueService.findById(id), "Issue", id))
    }
}
