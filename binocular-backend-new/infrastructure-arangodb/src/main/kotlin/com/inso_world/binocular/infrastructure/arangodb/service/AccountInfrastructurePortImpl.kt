package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IAccountUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.INoteAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IAccountDao
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.User
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class AccountInfrastructurePortImpl :
    AbstractInfrastructurePort<Account, String>(),
    AccountInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = accountDao
    }

    @Autowired
    private lateinit var accountDao: IAccountDao

    @Autowired
    private lateinit var issueAccountConnectionRepository: IIssueAccountConnectionDao

    @Autowired
    private lateinit var mergeRequestAccountConnectionRepository: IMergeRequestAccountConnectionDao

    @Autowired
    private lateinit var noteAccountConnectionRepository: INoteAccountConnectionDao

    @Autowired
    private lateinit var accountUserConnectionRepository: IAccountUserConnectionDao

    var logger: Logger = LoggerFactory.getLogger(AccountInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<Account> {
        logger.trace("Getting all accounts with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return accountDao.findAll(pageable)
    }

    override fun findById(id: String): Account? {
        logger.trace("Getting account by id: $id")
        return accountDao.findById(id)
    }

    override fun findByIid(iid: Account.Id): @Valid Account? {
        logger.trace("Getting account by iid: $iid")
        // Since we don't have a direct lookup by iid yet, and iid is a business UUID,
        // we might need to find by iid in the DAO.
        // For now, let's assume we can only find by technical ID if it was stored.
        // But the domain model now prefers iid.
        return accountDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Account.Id>): List<@Valid Account> {
        logger.trace("Getting accounts by iids: $iids")
        // Bulk lookup by iid
        return accountDao.findAll().filter { it.iid in iids }
    }

    override fun findIssuesByAccountId(accountId: String): List<Issue> {
        logger.trace("Getting issues for account: $accountId")
        return issueAccountConnectionRepository.findIssuesByAccount(accountId)
    }

    override fun findMergeRequestsByAccountId(accountId: String): List<MergeRequest> {
        logger.trace("Getting merge requests for account: $accountId")
        return mergeRequestAccountConnectionRepository.findMergeRequestsByAccount(accountId)
    }

    override fun findNotesByAccountId(accountId: String): List<Note> {
        logger.trace("Getting notes for account: $accountId")
        return noteAccountConnectionRepository.findNotesByAccount(accountId)
    }

    override fun findUsersByAccountId(accountId: String): List<User> {
        logger.trace("Getting users for account: $accountId")
        return accountUserConnectionRepository.findUsersByAccount(accountId)
    }

    override fun findAccountsByUserId(userId: String): List<Account> {
        logger.trace("Getting accounts for user: $userId")
        return accountUserConnectionRepository.findAccountsByUser(userId)
    }

    override fun findExistingGid(gids: List<String>): Iterable<Account> {
        TODO("Not yet implemented")
    }

    override fun findAll(): Iterable<Account> = accountDao.findAll()

    override fun create(entity: Account): Account = this.accountDao.save(entity)

    override fun saveAll(entities: Collection<Account>): Iterable<Account> = this.accountDao.saveAll(entities)

    override fun delete(entity: Account) {
        this.accountDao.delete(entity)
    }

    override fun update(entity: Account): Account = this.accountDao.update(entity)

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.accountDao.deleteAll()
    }
}
