package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.MilestoneEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a MergeRequest and a Milestone.
 */
@Edge(value = "mergeRequests-milestones")
data class MergeRequestMilestoneConnectionEntity(
    @Id var id: String? = null,
    @From var from: MergeRequestEntity,
    @To var to: MilestoneEntity,
)
