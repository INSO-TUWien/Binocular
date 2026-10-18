@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.annotation.Query
import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface AccountRepository :
    ArangoRepository<AccountEntity, String>,
    TechnicalIdentifiableRepository<AccountEntity> {
    @OptIn(ExperimentalUuidApi::class)
    @Query("FOR a IN accounts FILTER a.gid == TO_STRING(@iid) OR a.id == TO_STRING(@iid) RETURN a")
    override fun findByIid(
        @Param("iid") iid: Uuid
    ): AccountEntity?
}
