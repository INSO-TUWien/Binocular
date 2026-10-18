package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.core.persistence.exception.NotFoundException
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IDao
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.io.Serializable
import java.util.stream.Stream

@Repository
internal open class SqlDao<T, I : Serializable>(
    protected var repository: JpaRepository<T, I>? = null
) : IDao<T, I> {
    protected lateinit var clazz: Class<T>

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(SqlDao::class.java)
    }

    @PersistenceContext
    protected lateinit var entityManager: EntityManager

    override fun findById(id: I): T? = entityManager.find(clazz, id)

    override fun findAllById(ids: Iterable<I>): Iterable<T> = repository?.findAllById(ids) ?: emptyList()

    override fun findAll(): List<T> = entityManager.createQuery("FROM ${clazz.name}", clazz).resultList

    fun findAllEntities(): List<T> = findAll()

    override fun findAll(pageable: Pageable): Page<T> {
        val query = entityManager.createQuery("FROM ${clazz.name}", clazz)
        val totalElements =
            entityManager.createQuery("SELECT COUNT(e) FROM ${clazz.name} e", Long::class.java).singleResult

        val content =
            query
                .setFirstResult(pageable.pageNumber * pageable.pageSize)
                .setMaxResults(pageable.pageSize)
                .resultList

        return Page(content, totalElements, pageable)
    }

    override fun findAllAsStream(): Stream<T> = entityManager.createQuery("SELECT e FROM ${clazz.name} e", clazz).resultStream

    @Transactional
    override fun create(entity: T): T {
        entityManager.persist(entity)
        return entity
    }

    override fun findByIid(iid: Any): T? {
        TODO("Not yet implemented")
    }

    override fun findByIids(iids: Collection<Any>): List<T> {
        TODO("Not yet implemented")
    }

    override fun update(entity: T): T = entityManager.merge(entity)

    override fun updateAndFlush(entity: T): T {
        val updated = entityManager.merge(entity)
        entityManager.flush()
        return updated
    }

    override fun delete(entity: T) {
        entityManager.remove(entity)
    }

    override fun deleteById(id: I) {
        val entity = findById(id) ?: throw NotFoundException("Entity not found")
        delete(entity)
    }

    /**
     * Delete all entities
     */
    override fun deleteAll() {
        this.repository?.deleteAll()
    }

    /**
     * Save an entity (create or update)
     * For SQL, this is the same as create or update depending on whether the entity exists
     */
    @Deprecated("to be deleted")
    override fun save(entity: T): T =
        if (entityManager.contains(entity)) {
            update(entity)
        } else {
            create(entity)
        }

    /**
     * Save multiple entities
     */
    @Transactional
    override fun saveAll(entities: Collection<T>): Iterable<T> = this.repository?.saveAll(entities) ?: emptyList()

    @Transactional
    override fun flush() {
        logger.trace("EM flushing...")
        entityManager.flush()
        logger.trace("EM flushed")
    }

    override fun count(): Long = entityManager.createQuery("SELECT COUNT(e) FROM ${clazz.name} e", Long::class.java).singleResult
}
