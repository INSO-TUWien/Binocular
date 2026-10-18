@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.ProjectEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface ProjectRepository :
    ArangoRepository<ProjectEntity, String>,
    TechnicalIdentifiableRepository<ProjectEntity> {
    fun findByName(name: String): ProjectEntity?

    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): ProjectEntity?
}
