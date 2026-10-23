package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.AccountUserConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.NoteAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.ProjectAccountConnectionEntity
import org.springframework.data.annotation.Id
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Account entity.
 */
@Document("accounts")
data class AccountEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid? = null,
    val gid: String,
    val platform: PlatformEntity,
    val login: String,
    var name: String? = null,
    var avatarUrl: String? = null,
    var url: String? = null,
    @Relations(
        edges = [ProjectAccountConnectionEntity::class],
        direction = Relations.Direction.INBOUND,
        lazy = true,
        maxDepth = 1
    )
    val projects: Set<ProjectEntity> = emptySet(),
    @Relations(
        edges = [IssueAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var issues: Set<IssueEntity> = emptySet(),
    @Relations(
        edges = [MergeRequestAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var mergeRequests: Set<MergeRequestEntity> = emptySet(),
    @Relations(
        edges = [NoteAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var notes: Set<NoteEntity> = emptySet(),
    @Relations(
        edges = [AccountUserConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var users: List<UserEntity> = emptyList(),
)
