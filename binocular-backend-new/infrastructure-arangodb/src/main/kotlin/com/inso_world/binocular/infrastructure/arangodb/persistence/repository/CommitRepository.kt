package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.Uuid

@Repository
interface CommitRepository :
    ArangoRepository<CommitEntity, String>,
    TechnicalIdentifiableRepository<CommitEntity> {
    override fun findByIid(iid: Uuid): CommitEntity?

    fun findByRepository_IidAndSha(
        repoIid: Uuid,
        sha: String
    ): CommitEntity?

    @Query("FOR c IN commits FILTER c.repository.localPath == @repoPath AND c.sha IN @shas RETURN c")
    fun findByRepositoryAndShaIn(
        @Param("repoPath") repoPath: String,
        @Param("shas") shas: Collection<String>
    ): Iterable<CommitEntity>
}
