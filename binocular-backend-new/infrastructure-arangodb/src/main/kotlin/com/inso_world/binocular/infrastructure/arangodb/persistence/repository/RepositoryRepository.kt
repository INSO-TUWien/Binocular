package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.RepositoryEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface RepositoryRepository :
    ArangoRepository<RepositoryEntity, String>,
    TechnicalIdentifiableRepository<RepositoryEntity> {
    override fun findByIid(iid: Uuid): RepositoryEntity?

    fun findByLocalPath(localPath: String): RepositoryEntity?

    @Suppress("ktlint:standard:function-naming")
    fun findByProject_Name(projectName: String): RepositoryEntity?
}
