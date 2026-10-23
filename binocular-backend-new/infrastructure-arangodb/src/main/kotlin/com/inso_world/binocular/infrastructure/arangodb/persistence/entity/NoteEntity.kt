package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueNoteConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestNoteConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.NoteAccountConnectionEntity
import org.springframework.data.annotation.Id
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Note entity.
 */
@Document("notes")
data class NoteEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid? = null,
    var body: String,
    var createdAt: String,
    var updatedAt: String,
    var system: Boolean = true,
    var resolvable: Boolean = false,
    var confidential: Boolean = false,
    var internal: Boolean = false,
    var imported: Boolean = false,
    var importedFrom: String,
    @Relations(
        edges = [NoteAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var accounts: Set<AccountEntity> = emptySet(),
    @Relations(
        edges = [IssueNoteConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var issues: Set<IssueEntity> = emptySet(),
    @Relations(
        edges = [MergeRequestNoteConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var mergeRequests: Set<MergeRequestEntity> = emptySet(),
)
