package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.NoteEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Note and an Account.
 */
@Edge(value = "notes-accounts")
data class NoteAccountConnectionEntity(
    @Id var id: String? = null,
    @From var from: NoteEntity,
    @To var to: AccountEntity,
)
