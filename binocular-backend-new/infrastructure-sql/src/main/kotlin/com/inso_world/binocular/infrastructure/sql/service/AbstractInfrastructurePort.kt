package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IDao
import jakarta.persistence.EntityManager
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import java.io.Serializable
import java.util.stream.Stream
import kotlin.reflect.KClass

@Validated
internal abstract class AbstractInfrastructurePort<D : Any, E : Any, I : Serializable>(
    private val idKClass: KClass<I>,
) {
    @Autowired
    internal lateinit var entityManager: EntityManager

    internal lateinit var dao: IDao<E, I>

    @Transactional(readOnly = true)
    internal fun findById(id: I): E? = throw UnsupportedOperationException("use findByIid instead of findById")
//        dao.findById(id)

    @Transactional(readOnly = true)
    internal fun findAllEntities(): Iterable<E> = this.dao.findAll()

    @Transactional(readOnly = true)
    internal fun findAllEntities(pageable: Pageable): Page<E> {
        val entities = this.dao.findAll(pageable)
        return Page(entities.content, entities.totalElements, pageable)
    }

    @Transactional(readOnly = true)
    internal fun findByIid(iid: Any): E? = this.dao.findByIid(iid)

    @Transactional(readOnly = true)
    internal fun findByIids(iids: Collection<Any>): List<E> = this.dao.findByIids(iids)

    @Transactional(readOnly = true)
    internal fun findAllAsStream(): Stream<E> = this.dao.findAllAsStream()

    @Transactional
    internal fun updateEntity(
        @Valid value: E,
    ): E = this.dao.update(value)

    @Transactional
    internal fun delete(
        @Valid value: E,
    ): Nothing = throw UnsupportedOperationException()
//    {
//        this.dao.delete(value)
//    }

    @Transactional
    internal fun deleteByEntityId(id: String): Nothing = throw UnsupportedOperationException()
//    {
//        val value = read(id)
//        this.dao.deleteById(value)
//    }

    @Transactional
    internal fun updateAndFlush(
        @Valid value: E,
    ): E = this.dao.updateAndFlush(value)

//    @Transactional
//    internal fun deleteAllEntities(): Nothing = throw UnsupportedOperationException()

    @Transactional
    internal fun create(
        @Valid value: E,
    ): E = this.dao.create(value)

    @Transactional
    internal fun saveAll(values: Collection<@Valid E>): Iterable<E> = this.dao.saveAll(values)

    private fun read(value: String): I {
//        val value: String = readLine()!!
        return when (idKClass) {
            Int::class -> value.toInt() as I
            String::class -> value as I
            Long::class -> value.toLong() as I
            // add other types here if need
            else -> throw IllegalStateException("Unknown Generic Type")
        }
    }
}
