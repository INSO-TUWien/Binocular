@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestAccountConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestMilestoneConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestNoteConnectionEntity
import com.inso_world.binocular.model.Mention
import org.springframework.data.annotation.Id
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific MergeRequest entity.
 */
@OptIn(ExperimentalUuidApi::class)
@Document("mergeRequests")
data class MergeRequestEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid? = null,
    var platformIid: Int? = null,
    var title: String? = null,
    var description: String? = null,
    var createdAt: String? = null,
    var closedAt: String? = null,
    var updatedAt: String? = null,
    var labels: List<String> = emptyList(),
    var state: String? = null,
    var webUrl: String? = null,
    var mentions: List<MentionEntity> = emptyList(),

    @Ref
    var project: ProjectEntity? = null,

    @Relations(
        edges = [MergeRequestAccountConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var accounts: Set<AccountEntity> = emptySet(),
    @Relations(
        edges = [MergeRequestMilestoneConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var milestones: Set<MilestoneEntity> = emptySet(),
    @Relations(
        edges = [MergeRequestNoteConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.OUTBOUND,
    )
    var notes: Set<NoteEntity> = emptySet(),
)
