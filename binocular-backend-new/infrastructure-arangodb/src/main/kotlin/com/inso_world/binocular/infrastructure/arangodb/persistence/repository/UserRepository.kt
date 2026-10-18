@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import com.arangodb.springframework.repository.ArangoRepository
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
import org.springframework.stereotype.Repository
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Repository
interface UserRepository :
    ArangoRepository<UserEntity, String>,
    TechnicalIdentifiableRepository<UserEntity> {
    @OptIn(ExperimentalUuidApi::class)
    override fun findByIid(iid: Uuid): UserEntity?
}
