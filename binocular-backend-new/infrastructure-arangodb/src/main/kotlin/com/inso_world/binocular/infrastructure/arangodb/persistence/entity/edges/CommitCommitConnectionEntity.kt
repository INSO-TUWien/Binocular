package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between two Commits.
 */
@Edge(value = "commits-commits")
data class CommitCommitConnectionEntity(
    @Id var id: String? = null,
    @From var from: CommitEntity,
    @To var to: CommitEntity,
)
