package com.inso_world.binocular.infrastructure.arangodb.persistence.entity

import com.arangodb.springframework.annotation.Document
import com.arangodb.springframework.annotation.Field
import com.arangodb.springframework.annotation.PersistentIndexed
import com.arangodb.springframework.annotation.Ref
import com.arangodb.springframework.annotation.Relations
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.IssueMilestoneConnectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges.MergeRequestMilestoneConnectionEntity
import org.springframework.data.annotation.Id
import kotlin.uuid.Uuid

/**
 * ArangoDB-specific Milestone entity.
 */
@Document("milestones")
data class MilestoneEntity(
    @Id
    var id: String? = null,
    @Field("iid")
    @PersistentIndexed(unique = true)
    var iid: Uuid? = null,
    var platformIid: Int? = null,
    var title: String? = null,
    var description: String? = null,
    var createdAt: String? = null,
    var updatedAt: String? = null,
    var startDate: String? = null,
    var dueDate: String? = null,
    var state: String? = null,
    var expired: Boolean? = null,
    var webUrl: String? = null,
    @Ref
    var project: ProjectEntity? = null,
    @Relations(
        edges = [IssueMilestoneConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var issues: Set<IssueEntity> = emptySet(),
    @Relations(
        edges = [MergeRequestMilestoneConnectionEntity::class],
        lazy = true,
        maxDepth = 1,
        direction = Relations.Direction.INBOUND,
    )
    var mergeRequests: Set<MergeRequestEntity> = emptySet(),
)
