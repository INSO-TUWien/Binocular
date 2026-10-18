package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.ModuleInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.ModuleDto
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
@SchemaMapping(typeName = "Module")
internal class ModuleController(
    @Autowired private val moduleService: ModuleInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(ModuleController::class.java)

    /**
     * Find all modules with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the modules and pagination metadata.
     */
    @QueryMapping(name = "modules")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<ModuleDto> {
        logger.info("Getting all modules...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.DESC,
                sortBy = "path",
            )

        logger.debug(
            "Getting all modules with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = moduleService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a module by its ID.
     *
     * This method retrieves a single module based on the provided ID.
     * If no module is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the module to retrieve.
     * @return The module with the specified ID.
     * @throws GraphQLException if no module is found with the given ID.
     */
    @QueryMapping(name = "module")
    fun findById(
        @Argument id: String,
    ): ModuleDto {
        logger.info("Getting module by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(moduleService.findById(id), "Module", id))
    }
}
