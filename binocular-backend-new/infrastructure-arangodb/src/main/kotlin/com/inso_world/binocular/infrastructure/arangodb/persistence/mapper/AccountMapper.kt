package com.inso_world.binocular.infrastructure.arangodb.persistence.mapper

import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.core.persistence.proxy.RelationshipProxyFactory
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.model.Account
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
internal class AccountMapper
    @Autowired
    constructor(
        private val proxyFactory: RelationshipProxyFactory,
        @Lazy private val issueMapper: IssueMapper,
        @Lazy private val mergeRequestMapper: MergeRequestMapper,
        @Lazy private val noteMapper: NoteMapper,
        @Lazy private val userMapper: UserMapper,
    ) : EntityMapper<Account, AccountEntity> {
        /**
         * Converts a domain Account to an ArangoDB AccountEntity
         */
        override fun toEntity(domain: Account): AccountEntity =
            AccountEntity(
                id = domain.id,
                platform = domain.platform,
                login = domain.login,
                name = domain.name,
                avatarUrl = domain.avatarUrl,
                url = domain.url,
                // Relationships are handled by ArangoDB through edges
            )

        /**
         * Converts an ArangoDB AccountEntity to a domain Account
         *
         * Uses lazy loading proxies for relationships, which will only be loaded
         * when accessed. This provides a consistent API regardless of the database
         * implementation and avoids the N+1 query problem.
         */
        override fun toDomain(entity: AccountEntity): Account =
            Account(
                id = entity.id,
                platform = entity.platform,
                login = entity.login,
                name = entity.name,
                avatarUrl = entity.avatarUrl,
                url = entity.url,
                issues =
                    proxyFactory.createLazyList {
                        (entity.issues ?: emptyList()).map { issueEntity ->
                            issueMapper.toDomain(issueEntity)
                        }
                    },
                mergeRequests =
                    proxyFactory.createLazyList {
                        (entity.mergeRequests ?: emptyList()).map { mergeRequestEntity ->
                            mergeRequestMapper.toDomain(mergeRequestEntity)
                        }
                    },
                notes =
                    proxyFactory.createLazyList {
                        (entity.notes ?: emptyList()).map { noteEntity ->
                            noteMapper.toDomain(noteEntity)
                        }
                    }
            )

        /**
         * Converts a list of ArangoDB AccountEntity objects to a list of domain Account objects
         */
        override fun toDomainList(entities: Iterable<AccountEntity>): List<Account> = entities.map { toDomain(it) }
    }
