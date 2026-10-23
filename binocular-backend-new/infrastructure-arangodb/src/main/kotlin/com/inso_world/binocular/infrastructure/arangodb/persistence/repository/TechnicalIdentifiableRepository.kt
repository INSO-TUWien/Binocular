package com.inso_world.binocular.infrastructure.arangodb.persistence.repository

import kotlin.uuid.Uuid

/**
 * Interface for repositories that support lookup by technical identifier (iid).
 */
interface TechnicalIdentifiableRepository<E> {
    fun findByIid(iid: Uuid): E?
}
