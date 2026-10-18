package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IAccountDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.AccountRepository
import com.inso_world.binocular.model.Account
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Repository
import java.util.stream.Stream

@Repository
internal class AccountDao(
    @Autowired
    private val repo: AccountRepository,
) : SqlDao<AccountEntity, Long>(),
    IAccountDao {
    init {
        this.clazz = AccountEntity::class.java
        this.repository = repo
    }

    private object AccountEntitySpecification {
        fun hasGidIn(gids: List<String>): Specification<AccountEntity> =
            Specification { root, _, cb ->
                root.get<String>("gid").`in`(gids)
            }
    }

    override fun findExistingGid(gids: List<String>): Iterable<AccountEntity> = this.repo.findAll(AccountEntitySpecification.hasGidIn(gids))

    override fun findByIid(iid: Account.Id): AccountEntity? = repo.findByIid(iid)

    override fun findAllByIidIn(iids: Collection<Account.Id>): List<AccountEntity> = repo.findAllByIidIn(iids)

    override fun findAllByIssue(issue: IssueEntity): Stream<AccountEntity> = repo.findAllByIssuesContaining(issue)

    // TODO
//    override fun findAllByMergeRequest(mergeRequest: MergeRequestEntity): Stream<AccountEntity> {
//        return repo.findAllByMergeRequestsContaining(mergeRequest)
//    }

    // TODO uncomment when NoteEntity is implemented
//    override fun findAllByNote(note: NoteEntity): Stream<AccountEntity> {
//        return repo.findAllByNotesContaining(note)
//    }
}

// @Repository
// @Transactional
// class AccountDao(
//    @Autowired private val accountMapper: AccountMapper,
// ) {
//    @PersistenceContext
//    private lateinit var entityManager: EntityManager
//
//    override fun findById(id: String): Account? {
//        val entity = entityManager.find(AccountEntity::class.java, id) ?: return null
//        return accountMapper.toDomain(entity)
//    }
//
//    override fun findAll(): Iterable<Account> {
//        val query = entityManager.createQuery("FROM AccountEntity", AccountEntity::class.java)
//        val entities = query.resultList
//        return accountMapper.toDomainList(entities)
//    }
//
//    override fun findAll(pageable: Pageable): Page<Account> {
//        val query = entityManager.createQuery("FROM AccountEntity", AccountEntity::class.java)
//        val countQuery = entityManager.createQuery("SELECT COUNT(a) FROM AccountEntity a", Long::class.java)
//        val totalElements = countQuery.singleResult
//
//        val entities =
//            query
//                .setFirstResult(pageable.pageNumber * pageable.pageSize)
//                .setMaxResults(pageable.pageSize)
//                .resultList
//
//        val content = accountMapper.toDomainList(entities)
//        return Page(content, totalElements, pageable)
//    }
//
//    override fun create(entity: Account): Account {
//        val accountEntity = accountMapper.toEntity(entity)
//        entityManager.persist(accountEntity)
//        return accountMapper.toDomain(accountEntity)
//    }
//
//    override fun update(entity: Account): Account {
//        val accountEntity = accountMapper.toEntity(entity)
//        val mergedEntity = entityManager.merge(accountEntity)
//        return accountMapper.toDomain(mergedEntity)
//    }
//
//    override fun updateAndFlush(entity: Account): Account {
//        val result = update(entity)
//        entityManager.flush()
//        return result
//    }
//
//    override fun delete(entity: Account) {
//        val accountEntity = accountMapper.toEntity(entity)
//        val managedEntity = entityManager.merge(accountEntity)
//        entityManager.remove(managedEntity)
//    }
//
//    override fun deleteById(id: String) {
//        val entity = entityManager.find(AccountEntity::class.java, id) ?: return
//        entityManager.remove(entity)
//    }
//
//    /**
//     * Delete all entities
//     */
//    override fun deleteAll() {
//        val accounts =
//            entityManager
//                .createQuery("SELECT a FROM AccountEntity a", AccountEntity::class.java)
//                .resultList
//        accounts.forEach { entityManager.remove(it) }
//    }
//
//    /**
//     * Save an entity (create or update)
//     * For SQL, this is the same as create or update depending on whether the entity exists
//     */
//    override fun save(entity: Account): Account {
//        val accountEntity = accountMapper.toEntity(entity)
//        return if (entityManager.find(AccountEntity::class.java, accountEntity.id) != null) {
//            update(entity)
//        } else {
//            create(entity)
//        }
//    }
//
//    /**
//     * Save multiple entities
//     */
//    override fun saveAll(entities: List<Account>): Iterable<Account> = entities.map { save(it) }
// }
