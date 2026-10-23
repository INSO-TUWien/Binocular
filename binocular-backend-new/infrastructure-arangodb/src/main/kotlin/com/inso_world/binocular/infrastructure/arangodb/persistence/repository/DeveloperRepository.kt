package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface DeveloperRepository :
    ArangoRepository<DeveloperEntity, String>,
    TechnicalIdentifiableRepository<DeveloperEntity> {
    override fun findByIid(iid: Uuid): DeveloperEntity?
}
