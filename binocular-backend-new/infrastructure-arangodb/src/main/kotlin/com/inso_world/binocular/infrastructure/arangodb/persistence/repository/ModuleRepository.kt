package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ModuleEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface ModuleRepository :
    ArangoRepository<ModuleEntity, String>,
    TechnicalIdentifiableRepository<ModuleEntity> {
    override fun findByIid(iid: Uuid): ModuleEntity?
}
