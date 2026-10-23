package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MentionEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Mention and an Account.
 */
@Edge(value = "mention-account")
data class MentionAccountConnectionEntity(
    @Id var id: String? = null,
    @From var from: MentionEntity,
    @To var to: AccountEntity,
)
