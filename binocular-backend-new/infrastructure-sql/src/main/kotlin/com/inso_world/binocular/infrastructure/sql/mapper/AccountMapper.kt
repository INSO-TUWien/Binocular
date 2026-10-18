package com.inso_world.binocular.infrastructure.sql.mapper

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.mapper.EntityMapper
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.toSqlEntity
import com.inso_world.binocular.model.Account
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import kotlin.getValue

@Component
internal class AccountMapper : EntityMapper<Account, AccountEntity> {
    companion object {
        private val logger by logger()
    }

    /**
     * Converts a domain Account to a SQL AccountEntity
     */
    override fun toEntity(domain: Account): AccountEntity {
        val entity = domain.toSqlEntity()
        return entity
    }

    /**
     * Converts a SQL AccountEntity to a domain Account
     */
    @Transactional(readOnly = true)
    override fun toDomain(entity: AccountEntity): Account = entity.toDomain()

    /**
     * Converts a list of SQL AccountEntity objects to a list of domain Account objects
     */
    override fun toDomainList(entities: Iterable<AccountEntity>): List<Account> = entities.map { toDomain(it) }
}
