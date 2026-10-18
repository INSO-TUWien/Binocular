@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Interface for repositories that support lookup by technical identifier (iid).
 */
@OptIn(ExperimentalUuidApi::class)
interface TechnicalIdentifiableRepository<E> {
    fun findByIid(iid: Uuid): E?
}
