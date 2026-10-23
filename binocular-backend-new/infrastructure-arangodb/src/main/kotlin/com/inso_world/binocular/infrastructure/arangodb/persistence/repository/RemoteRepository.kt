package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RemoteEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface RemoteRepository :
    ArangoRepository<RemoteEntity, String>,
    TechnicalIdentifiableRepository<RemoteEntity> {
    override fun findByIid(iid: Uuid): RemoteEntity?
}
