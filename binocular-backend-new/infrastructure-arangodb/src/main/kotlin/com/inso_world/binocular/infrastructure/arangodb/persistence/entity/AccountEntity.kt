package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.NoteAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.AccountUserConnectionEntity
import com.inso_world.binocular.model.Platform
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific Account entity.
 */
@Document("accounts")
data class AccountEntity(
    @Id
    var id: String? = null,
    var platform: Platform? = null,
    var login: String? = null,
    var name: String? = null,
    var avatarUrl: String? = null,
    var url: String? = null,
    @Relations(
        edges = [IssueAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var issues: List<IssueEntity> = emptyList(),
    @Relations(
        edges = [MergeRequestAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var mergeRequests: List<MergeRequestEntity> = emptyList(),
    @Relations(
        edges = [NoteAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var notes: List<NoteEntity> = emptyList(),
    @Relations(
        edges = [AccountUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var users: List<UserEntity> = emptyList(),
)
