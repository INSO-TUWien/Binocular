package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.AccountDto
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
@SchemaMapping(typeName = "Account")
internal class AccountController(
    @Autowired private val accountService: AccountInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(AccountController::class.java)

    /**
     * Find all accounts with pagination.
     *
     * @param page The page number (1-based). If null, defaults to 1.
     * @param perPage The number of items per page. If null, defaults to 20.
     * @param sort Optional sort direction (ASC|DESC). Defaults to ASC when not provided.
     * @return A Page object containing the accounts and pagination metadata.
     */
    @QueryMapping(name = "accounts")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<AccountDto> {
        logger.info("Getting all accounts...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.ASC,
                sortBy = "id",
            )

        logger.debug(
            "Getting all accounts with properties page={}, perPage={}, sort={}",
            pageable.pageNumber + 1,
            pageable.pageSize,
            pageable.sort
        )

        val result = accountService.findAll(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find an account by its ID.
     *
     * This method retrieves a single account based on the provided ID.
     * If no account is found with the given ID, an exception is thrown.
     *
     * @param id The unique identifier of the account to retrieve.
     * @return The account with the specified ID.
     * @throws GraphQLException if no account is found with the given ID.
     */
    @QueryMapping(name = "account")
    fun findById(
        @Argument id: String,
    ): AccountDto {
        logger.info("Getting account by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(accountService.findById(id), "Account", id))
    }
}
