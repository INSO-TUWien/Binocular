package com.inso_world.binocular.core.service

import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.User

/**
 * Interface for AccountService.
 * Provides methods to retrieve accounts and their related entities.
 *
 * @deprecated Use [ProjectInfrastructurePort] instead. Account is part of the Project aggregate
 *             and should be accessed through its aggregate root.
 */
@Deprecated(
    message = "Use ProjectInfrastructurePort instead. Account is part of the Project aggregate.",
    replaceWith = ReplaceWith("ProjectInfrastructurePort"),
    level = DeprecationLevel.WARNING
)
interface AccountInfrastructurePort : BinocularInfrastructurePort<Account, Account.Id> {
    /**
     * Find issues by account ID.
     *
     * @param accountId The ID of the account
     * @return List of issues associated with the account
     */
    fun findIssuesByAccountId(accountId: String): List<Issue>

    /**
     * Find merge requests by account ID.
     *
     * @param accountId The ID of the account
     * @return List of merge requests associated with the account
     */
    fun findMergeRequestsByAccountId(accountId: String): List<MergeRequest>

    /**
     * Find notes by account ID.
     *
     * @param accountId The ID of the account
     * @return List of notes associated with the account
     */
    fun findNotesByAccountId(accountId: String): List<Note>

    /**
     * Find users by account ID.
     *
     * @param accountId The ID of the account
     * @return List of users associated with the account
     */
    fun findUsersByAccountId(accountId: String): List<User>

    /**
     * Find accounts by user ID.
     *
     * @param userId The ID of the user
     * @return List of accounts associated with the user
     */
    fun findAccountsByUserId(userId: String): List<Account>

    /**
     * Find existing GitHub Accounts via gid.
     *
     * @param gids The list of GitHub account IDs
     * @return the Accounts associated with the IDs
     */
    fun findExistingGid(gids: List<String>,): Iterable<Account>
}
