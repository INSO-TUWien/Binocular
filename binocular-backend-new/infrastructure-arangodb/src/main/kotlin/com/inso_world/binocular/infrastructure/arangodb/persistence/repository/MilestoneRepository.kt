package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MilestoneEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface MilestoneRepository :
    ArangoRepository<MilestoneEntity, String>,
    TechnicalIdentifiableRepository<MilestoneEntity> {
    override fun findByIid(iid: Uuid): MilestoneEntity?
}
