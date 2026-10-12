package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Ref
import java.util.Date

/**
 * Mention entity for ArangoDB based on the domain model.
 */
data class MentionEntity(
    var commit: String? = null,
    var createdAt: Date? = null,
    var closes: Boolean? = null,
    @Ref(lazy = true)
    var actor: AccountEntity? = null
)
