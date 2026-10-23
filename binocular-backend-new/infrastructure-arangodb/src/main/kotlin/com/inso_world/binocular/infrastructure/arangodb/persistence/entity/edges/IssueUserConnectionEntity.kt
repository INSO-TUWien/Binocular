package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between an Issue and a User.
 */
@Edge(value = "issues-users")
data class IssueUserConnectionEntity(
    @Id var id: String? = null,
    @From var from: IssueEntity,
    @To var to: UserEntity,
)
