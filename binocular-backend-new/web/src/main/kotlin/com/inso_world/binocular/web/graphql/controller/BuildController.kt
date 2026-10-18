package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.BuildInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.BuildDto
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
@SchemaMapping(typeName = "Build")
internal class BuildController(
    @Autowired private val buildService: BuildInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(BuildController::class.java)

    /**
     * Find all builds with pagination and optional time-range filtering.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param since Optional timestamp (epoch millis) to include only builds created at or after this moment.
     * @param until Optional timestamp (epoch millis) to include only builds created at or before this moment.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the builds and pagination metadata.
     */
    @QueryMapping(name = "builds")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument since: Long?,
        @Argument until: Long?,
        @Argument sort: Sort?,
    ): PageDto<BuildDto> {
        logger.info("Getting all builds...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.DESC,
                sortBy = "id",
            )

        logger.debug(
            "Getting all builds with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = buildService.findAll(pageable, since, until)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a build by its ID.
     *
     * This method retrieves a single build based on the provided ID.
     * If no build is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the build to retrieve.
     * @return The build with the specified ID.
     * @throws GraphQLException if no build is found with the given ID.
     */
    @QueryMapping(name = "build")
    fun findById(
        @Argument id: String,
    ): BuildDto {
        logger.info("Getting build by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(buildService.findById(id), "Build", id))
    }
}
