package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.core.service.exception.NotFoundException
import com.inso_world.binocular.infrastructure.sql.mapper.AccountMapper
import com.inso_world.binocular.infrastructure.sql.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.AccountDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.ProjectDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.User
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.slf4j.Logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated

@Service
@Validated
 internal class AccountInfrastructurePortImpl
@Autowired constructor(
    @Autowired val accountDao: AccountDao,
    @Autowired val projectMapper: ProjectMapper,
    @Autowired val accountMapper: AccountMapper,
    @Autowired private val projectDao: ProjectDao
) : AbstractInfrastructurePort<Account, AccountEntity, Long>(Long::class),
    AccountInfrastructurePort {
    var logger: Logger = LoggerFactory.getLogger(AccountInfrastructurePortImpl::class.java)

    init {
        this.dao = accountDao
    }

    @Autowired

    override fun findAll(): Iterable<@Valid Account> {
        return super<AbstractInfrastructurePort>.findAllEntities()
            .map { entity ->
                accountMapper.toDomain(entity)
            }
    }

    override fun findAll(pageable: Pageable): Page<@Valid Account> {
        TODO("Not yet implemented")
    }

    override fun findById(id: String): @Valid Account? {
        TODO("Not yet implemented")
    }

    @Transactional
    override fun create(value: Account): @Valid Account {
        val entity = accountMapper.toEntity(value)
        val created = accountDao.create(entity)
        return accountMapper.toDomain(created)
    }

    @Transactional
    override fun update(value: Account): @Valid Account {
        val entity = accountMapper.toEntity(value)
        val updated = accountDao.update(entity)
        return accountMapper.toDomain(updated)
    }

    override fun findUsersByAccountId(accountId: String): List<User> {
        TODO("Not yet implemented")
    }

    override fun findAccountsByUserId(userId: String): List<Account> {
        TODO("Not yet implemented")
    }

    @Transactional(readOnly = true)
    override fun findByIid(iid: Account.Id): Account? {
        logger.trace("Getting account by iid: $iid")
        val entity = accountDao.findByIid(iid) ?: return null
        return accountMapper.toDomain(entity)
    }

    @Transactional(readOnly = true)
    override fun findByIids(iids: Collection<Account.Id>): List<Account> {
        logger.trace("Getting accounts by iids: $iids")
        val entities = accountDao.findAllByIidIn(iids)
        return accountMapper.toDomainList(entities)
    }

    @Deprecated("Save accounts via project instead.")
    @Transactional
    override fun saveAll(values: Collection<@Valid Account>): Iterable<@Valid Account> {
        logger.trace("Save all accounts (${values.size})")



        val entities = values.map {
//            val projectEntity =
//                projectDao.findByIid(it.project.iid)
//                    ?: throw NotFoundException("Project ${it.project.iid} not found")
//
//            ctx.remember(it.project, projectEntity)

            accountMapper.toEntity(it)
        }
        val savedEntities = accountDao.saveAll(entities)
        entityManager.flush()
        return accountMapper.toDomainList(savedEntities)
    }

    override fun findIssuesByAccountId(accountId: String): List<Issue> {
        TODO("Not yet implemented")
    }

    override fun findMergeRequestsByAccountId(accountId: String): List<MergeRequest> {
        TODO("Not yet implemented")
    }

    override fun findNotesByAccountId(accountId: String): List<Note> {
        TODO("Not yet implemented")
    }

    @Transactional(readOnly = true)
    override fun findExistingGid(gids: List<String>): Iterable<Account> {
        return accountDao
            .findExistingGid(gids)
            .map(accountMapper::toDomain)
    }

}
