package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.UserEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between an Account and a User.
 */
@Edge(value = "accounts-users")
data class AccountUserConnectionEntity(
    @Id var id: String? = null,
    @From var from: AccountEntity,
    @To var to: UserEntity,
)
