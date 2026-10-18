package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.MergeRequestInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.MergeRequestDto
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
@SchemaMapping(typeName = "mergeRequest")
internal class MergeRequestController(
    @Autowired private val mergeRequestService: MergeRequestInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(MergeRequestController::class.java)

    /**
     * Find all merge requests with pagination and optional time-range filtering.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param since Optional timestamp (epoch millis) to include only merge requests created at or after this moment.
     * @param until Optional timestamp (epoch millis) to include only merge requests created at or before this moment.
     * @param sort Optional sort direction (ASC|DESC). Defaults to ASC when not provided.
     * @return A Page object containing the merge requests and pagination metadata.
     */
    @QueryMapping(name = "mergeRequests")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument since: Long?,
        @Argument until: Long?,
        @Argument sort: Sort?,
    ): PageDto<MergeRequestDto> {
        logger.info("Getting all merge requests with since=$since, until=$until")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.ASC,
                sortBy = "createdAt",
            )

        logger.debug(
            "Getting all merge requests with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = mergeRequestService.findAll(pageable, since, until)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a merge request by its ID.
     *
     * This method retrieves a single merge request based on the provided ID.
     * If no merge request is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the merge request to retrieve.
     * @return The merge request with the specified ID.
     * @throws GraphQLException if no merge request is found with the given ID.
     */
    @QueryMapping(name = "mergeRequest")
    fun findById(
        @Argument id: String,
    ): MergeRequestDto {
        logger.info("Getting merge request by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(mergeRequestService.findById(id), "MergeRequest", id))
    }
}
