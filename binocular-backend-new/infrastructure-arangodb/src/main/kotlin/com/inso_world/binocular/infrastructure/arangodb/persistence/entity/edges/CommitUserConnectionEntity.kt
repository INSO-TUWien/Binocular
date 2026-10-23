package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Commit and a User.
 */
@Edge(value = "commits-users")
data class CommitUserConnectionEntity(
    @Id var id: String? = null,
    @From var from: CommitEntity,
    @To var to: UserEntity,
)
