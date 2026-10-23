package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RevisionEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface RevisionRepository :
    ArangoRepository<RevisionEntity, String>,
    TechnicalIdentifiableRepository<RevisionEntity> {
    override fun findByIid(iid: Uuid): RevisionEntity?
}
