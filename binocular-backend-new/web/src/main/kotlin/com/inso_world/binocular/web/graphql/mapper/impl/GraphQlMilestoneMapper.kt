package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.web.graphql.model.MilestoneDto
import org.springframework.stereotype.Component

@Component
class GraphQlMilestoneMapper {
    fun toDto(milestone: Milestone): MilestoneDto =
        MilestoneDto(
            id = milestone.id,
            iid = milestone.platformIid,
            title = milestone.title,
            description = milestone.description,
            state = milestone.state,
            createdAt = milestone.createdAt,
            updatedAt = milestone.updatedAt,
            dueDate = milestone.dueDate,
            startDate = milestone.startDate,
            webUrl = milestone.webUrl
        )
}
