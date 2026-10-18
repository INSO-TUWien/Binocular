package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.BranchInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.BranchDto
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
@SchemaMapping(typeName = "Branch")
internal class BranchController(
    @Autowired private val branchService: BranchInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(BranchController::class.java)

    /**
     * Find all branches with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the branches and pagination metadata.
     */
    @QueryMapping(name = "branches")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<BranchDto> {
        logger.info("Getting all branches...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.ASC,
                sortBy = "branch",
            )

        logger.debug(
            "Getting all branches with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = branchService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Resolve a single branch by either its unique ID or its name.
     *
     * Exactly one of {@code id} or {@code branchName} must be provided.
     * Supplying both parameters or neither will result in an {@link IllegalArgumentException}.
     *
     * The branch is looked up using the provided identifier and validated for existence.
     * If no matching branch is found, a {@link graphql.GraphQLException} is thrown.
     *
     * @param id the unique identifier of the branch to retrieve (optional)
     * @param branchName the name of the branch to retrieve (optional)
     * @return the resolved {@link Branch}
     * @throws IllegalArgumentException if both or neither parameters are provided
     * @throws graphql.GraphQLException if no branch exists for the given identifier
     */
    @QueryMapping(name = "branch")
    fun findById(
        @Argument id: String?,
        @Argument branchName: String?,
    ): BranchDto {
        logger.info("Getting branch by id: $id or branchName: $branchName")
        if ((id == null && branchName == null) || (id != null && branchName != null)) {
            throw IllegalArgumentException("Exactly one of 'id' or 'branchName' must be provided")
        }

        if (id != null) {
            return mapper.toDto(GraphQLValidationUtils.requireEntityExists(branchService.findById(id), "Branch", id))
        }

        return mapper.toDto(
            GraphQLValidationUtils.requireEntityExists(
                branchService.findByName(requireNotNull(branchName)),
                "Branch",
                branchName
            )
        )
    }
}
