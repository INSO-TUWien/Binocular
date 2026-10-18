package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge

import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueAccountConnection
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.enums.IssueAccountRole

/**
 * Interface for IssueAccountConnection DAO operations.
 * This interface is implemented by both ArangoDB and SQL DAOs.
 */
internal interface IIssueAccountConnectionDao {
    /**
     * Find all accounts connected to an issue
     */
    fun findAccountsByIssue(issueId: String): List<Account>

    /**
     * Find all accounts connected to an issue with a specific role
     */
    fun findAccountsByIssue(
        issueId: String,
        role: IssueAccountRole
    ): List<Account>

    /**
     * Find all issues connected to an account
     */
    fun findIssuesByAccount(accountId: String): List<Issue>

    /**
     * Save an issue-account connection
     */
    fun save(connection: IssueAccountConnection): IssueAccountConnection

    /**
     * Delete all issue-account connections
     */
    fun deleteAll()
}
