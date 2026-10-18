package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.UserInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.PageDto
import com.inso_world.binocular.web.graphql.model.Sort
import com.inso_world.binocular.web.graphql.model.UserDto
import com.inso_world.binocular.web.util.PaginationUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
@SchemaMapping(typeName = "User")
internal class UserController(
    @Autowired private val userService: UserInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(UserController::class.java)

    /**
     * Find all users with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to DESC when not provided.
     * @return A Page object containing the users and pagination metadata.
     */
    @QueryMapping(name = "users")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<UserDto> {
        logger.info("Getting all users...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.ASC,
                sortBy = "gitSignature",
            )

        logger.debug(
            "Getting all users with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = userService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a user by its ID.
     *
     * Retrieves a single user based on the provided unique identifier. If the user cannot be found,
     * a GraphQLException is thrown.
     *
     * @param id the unique identifier of the user to retrieve
     * @return the user with the specified ID
     * @throws graphql.GraphQLException if no user exists with the given ID
     */
    @QueryMapping(name = "user")
    fun findById(
        @Argument id: String,
    ): UserDto {
        logger.info("Getting user by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(userService.findById(id), "User", id))
    }
}
