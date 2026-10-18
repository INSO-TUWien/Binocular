@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IRepositoryDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.RepositoryEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.RepositoryRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi

@Repository
internal class RepositoryDao(
    @Autowired
    private val repo: RepositoryRepository,
) : SqlDao<RepositoryEntity, Long>(),
    IRepositoryDao {
    init {
        this.clazz = RepositoryEntity::class.java
        this.repository = repo
    }

    override fun findByIdWithAllRelations(id: Long): RepositoryEntity? = repo.findByIdWithAllRelations(id)

    override fun findByName(name: String): RepositoryEntity? = repo.findByLocalPath(name)

    override fun findByIid(iid: Any): RepositoryEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is com.inso_world.binocular.model.Repository.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> kotlin.uuid.Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return this.repo.findByIid(uIid)
    }

    override fun findByIids(iids: Collection<Any>): List<RepositoryEntity> {
        val uIids =
            iids.map { iid ->
                when (iid) {
                    is com.inso_world.binocular.model.Repository.Id -> iid.value
                    is kotlin.uuid.Uuid -> iid
                    is String -> kotlin.uuid.Uuid.parse(iid)
                    else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
                }
            }
        return this.repo.findAllByIidIn(uIids)
    }
}
