@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface FileRepository :
    ArangoRepository<FileEntity, String>,
    TechnicalIdentifiableRepository<FileEntity> {
    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): FileEntity?

    @Query(
        """
        FOR f IN files
          FILTER f.path == @path
          LIMIT 1
          RETURN f
        """
    )
    fun findByPath(path: String): FileEntity?
}
