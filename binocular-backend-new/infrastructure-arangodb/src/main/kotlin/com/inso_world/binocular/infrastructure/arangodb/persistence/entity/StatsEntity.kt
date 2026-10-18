package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.inso_world.binocular.model.Stats
import org.springframework.data.annotation.Id

/**
 * Stats entity for ArangoDB based on the domain model.
 */
@Document("stats")
data class StatsEntity(
    @Id var id: String? = null,
    var additions: Long,
    var deletions: Long,
    var kind: Stats.StatsKind? = null,
)
