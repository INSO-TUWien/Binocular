@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.connection

import com.inso_world.binocular.infrastructure.arangodb.model.edge.IssueAccountConnection
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.AccountMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.mapper.IssueMapper
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.AccountRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.IssueRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.repository.edges.IssueAccountConnectionRepository
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.enums.IssueAccountRole
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository

/**
 * ArangoDB implementation of IIssueAccountConnectionDao.
 *
 * This class adapts the existing IssueAccountConnectionRepository to work with
 * the new domain model and entity structure.
 */

@Repository
internal class IssueAccountConnectionDao
    @Autowired
    constructor(
        private val repository: IssueAccountConnectionRepository,
        private val issueRepository: IssueRepository,
        private val accountRepository: AccountRepository,
        private val issueMapper: IssueMapper,
        private val accountMapper: AccountMapper,
    ) : IIssueAccountConnectionDao {
        /**
         * Find all accounts connected to an issue
         */
        override fun findAccountsByIssue(issueId: String): List<Account> {
            val accountEntities = repository.findAccountsByIssue(issueId)
            return accountEntities.map { accountMapper.toDomain(it) }
        }

        /**
         * Finds all accounts connected to the given issue with the specified role.
         */
        override fun findAccountsByIssue(
            issueId: String,
            role: IssueAccountRole
        ): List<Account> {
            val accountEntities = repository.findAccountsByIssueAndRole(issueId, role.value)
            return accountEntities.map { accountMapper.toDomain(it) }
        }

        /**
         * Find all issues connected to an account
         */
        override fun findIssuesByAccount(accountId: String): List<Issue> {
            val issueEntities = repository.findIssuesByAccount(accountId)
            return issueEntities.map { issueMapper.toDomain(it) }
        }

        /**
         * Save an issue-account connection
         */
        override fun save(connection: IssueAccountConnection): IssueAccountConnection {
            // Get the issue and account entities from their repositories
            val issueEntity =
                issueRepository.findById(connection.from.id!!).orElseThrow {
                    IllegalArgumentException("Issue with ID ${connection.from.id} not found")
                }
            val accountEntity =
                accountRepository.findById(connection.to.id!!).orElseThrow {
                    IllegalArgumentException("Account with ID ${connection.to.id} not found")
                }

            // Convert domain model to the repository entity format
            val entity =
                IssueAccountConnectionEntity(
                    id = connection.id,
                    from = issueEntity,
                    to = accountEntity,
                    role = connection.role?.value,
                )

            // Save using the repository
            val savedEntity = repository.save(entity)

            // Convert back to domain model
            return IssueAccountConnection(
                id = savedEntity.id,
                from = issueMapper.toDomain(savedEntity.from),
                to = accountMapper.toDomain(savedEntity.to),
            )
        }

        /**
         * Delete all issue-account connections
         */
        override fun deleteAll() {
            repository.deleteAll()
        }
    }
