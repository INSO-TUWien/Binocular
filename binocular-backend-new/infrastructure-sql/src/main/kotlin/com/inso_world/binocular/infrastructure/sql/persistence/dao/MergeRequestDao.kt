package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IMergeRequestDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.MergeRequestRepository
import com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository
import com.inso_world.binocular.model.MergeRequest
import org.springframework.stereotype.Repository

@Repository
internal class MergeRequestDao(
    private val mrRepository: MergeRequestRepository,
    private val projectRepository: ProjectRepository
) : SqlDao<MergeRequestEntity, Long>(mrRepository),
    IMergeRequestDao {
    init {
        this.clazz = MergeRequestEntity::class.java
        this.repository = mrRepository
    }

    override fun findById(id: Long): MergeRequestEntity? = mrRepository.findById(id).orElse(null)

    override fun findByIid(iid: Any): MergeRequestEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is MergeRequest.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> kotlin.uuid.Uuid.parse(iid)
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return mrRepository.findByIid(uIid)
    }

    override fun findByIid(iid: MergeRequest.Id): MergeRequestEntity? = findByIid(iid as Any)

    override fun findByIids(iids: Collection<Any>): List<MergeRequestEntity> = iids.mapNotNull { findByIid(it) }

    override fun create(entity: MergeRequestEntity): MergeRequestEntity = mrRepository.save(entity)

    override fun update(entity: MergeRequestEntity): MergeRequestEntity = mrRepository.save(entity)
}
