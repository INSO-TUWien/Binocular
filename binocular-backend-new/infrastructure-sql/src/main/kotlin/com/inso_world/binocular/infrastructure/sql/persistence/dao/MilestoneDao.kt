@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MilestoneEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.MilestoneRepository
import com.inso_world.binocular.model.Milestone
import org.springframework.stereotype.Repository

internal interface IMilestoneDao : IDao<MilestoneEntity, Long> {
    fun findByIid(iid: Milestone.Id): MilestoneEntity?
}

@Repository
internal class MilestoneDao(
    private val milestoneRepository: MilestoneRepository
) : SqlDao<MilestoneEntity, Long>(milestoneRepository),
    IMilestoneDao {
    init {
        this.clazz = MilestoneEntity::class.java
        this.repository = milestoneRepository
    }

    override fun findByIid(iid: Milestone.Id): MilestoneEntity? = milestoneRepository.findByIid(iid.value)
}
