package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Build
import com.inso_world.binocular.web.graphql.model.BuildDto
import org.springframework.stereotype.Component

@Component
class GraphQlBuildMapper(
    private val jobMapper: GraphQlJobMapper
) {
    fun toDto(build: Build): BuildDto =
        BuildDto(
            id = build.id,
            sha = build.sha,
            ref = build.ref,
            status = build.status,
            tag = build.tag,
            user = build.user,
            userFullName = build.userFullName,
            createdAt = build.createdAt,
            updatedAt = build.updatedAt,
            startedAt = build.startedAt,
            finishedAt = build.finishedAt,
            committedAt = build.committedAt,
            duration = build.duration,
            webUrl = build.webUrl,
            jobs = build.jobs.map { jobMapper.toDto(it) }
        )
}
