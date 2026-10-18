package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.web.graphql.model.CommitDto
import org.springframework.stereotype.Component

@Component
class GraphQlCommitMapper(
    private val statsMapper: GraphQlStatsMapper
) {
    fun toDto(commit: Commit): CommitDto =
        CommitDto(
            id = commit.id,
            sha = commit.sha,
            authorDateTime = commit.authorDateTime,
            commitDateTime = commit.commitDateTime,
            message = commit.message,
            webUrl = commit.webUrl,
            stats = commit.stats?.let { statsMapper.toDto(it) },
            branch = commit.branch
        )
}
