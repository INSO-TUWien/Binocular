package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.core.service.UserInfrastructurePort
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
@Deprecated("Use DeveloperResolver instead")
class UserResolver(
    @Autowired(required = false) private val userService: UserInfrastructurePort?,
    private val accountService: AccountInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(UserResolver::class.java)

    /**
     * Resolves the id field for a User in GraphQL.
     *
     * This method resolves the legacy User ID by looking up the first
     * associated account of the given user.
     * If the user ID is null or no account is found, null is returned.
     *
     * @param user The user for which to resolve the legacy ID
     * @return The resolved account ID, or null if the user ID is null or no account exists
     */
    @SchemaMapping(typeName = "User", field = "id")
    fun id(user: UserDto): String? {
        val userId = user.id ?: return null
        logger.info("Resolving legacy User.id for user: $userId")
        return accountService
            .findAccountsByUserId(userId)
            .firstOrNull()
            ?.id
    }

    /**
     * Resolves the commits field for a User in GraphQL.
     *
     * This method retrieves all commits associated with the given user.
     * If the user ID is null, an empty list is returned.
     *
     * @param user The user for which to retrieve commits
     * @return A list of commits associated with the user, or an empty list if the user ID is null
     */
    @SchemaMapping(typeName = "User", field = "commits")
    fun commits(user: UserDto): List<CommitDto> {
        val id = user.id ?: return emptyList()
        logger.info("Resolving commits for user: $id")
        // Get all connections for this user and extract the commits
        return userService?.findCommitsByUserId(id)?.map { mapper.toDto(it) } ?: emptyList()
    }

    /**
     * Resolves the issues field for a User in GraphQL.
     *
     * This method retrieves all issues associated with the given user.
     * If the user ID is null, an empty list is returned.
     *
     * @param user The user for which to retrieve issues
     * @return A list of issues associated with the user, or an empty list if the user ID is null
     */
    @SchemaMapping(typeName = "User", field = "issues")
    fun issues(user: UserDto): List<IssueDto> {
        val id = user.id ?: return emptyList()
        logger.info("Resolving issues for user: $id")
        // Get all connections for this user and extract the issues
        return userService?.findIssuesByUserId(id)?.map { mapper.toDto(it) } ?: emptyList()
    }

    /**
     * Resolves the files field for a User in GraphQL.
     *
     * This method retrieves all files associated with the given user.
     * If the user ID is null, an empty list is returned.
     *
     * @param user The user for which to retrieve files
     * @return A list of files associated with the user, or an empty list if the user ID is null
     */
    @SchemaMapping(typeName = "User", field = "files")
    fun files(user: UserDto): List<FileDto> {
        val id = user.id ?: return emptyList()
        logger.info("Resolving files for user: $id")
        // Get all connections for this user and extract the files
        return userService?.findFilesByUserId(id)?.map { mapper.toDto(it) } ?: emptyList()
    }

    /**
     * Resolves the account field for a User in GraphQL.
     *
     * This method retrieves the first account associated with the given user.
     * If the user ID is null or no account is found, null is returned.
     *
     * @param user The user for which to retrieve the account
     * @return The associated account, or null if the user ID is null or no account exists
     */
    @SchemaMapping(typeName = "User", field = "account")
    fun account(user: UserDto): AccountDto? {
        val userId = user.id ?: return null
        logger.info("Resolving account for user: $userId")
        val accounts = accountService.findAccountsByUserId(userId)
        return accounts.firstOrNull()?.let { mapper.toDto(it) }
    }
}
