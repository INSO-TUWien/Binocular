package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Job
import com.inso_world.binocular.web.graphql.model.JobDto
import org.springframework.stereotype.Component

@Component
class GraphQlJobMapper {
    fun toDto(job: Job): JobDto =
        JobDto(
            id = job.id,
            name = job.name,
            status = job.status,
            stage = job.stage,
            createdAt = job.createdAt,
            finishedAt = job.finishedAt,
            webUrl = job.webUrl
        )
}
