package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Stats
import com.inso_world.binocular.web.graphql.model.StatsDto
import org.springframework.stereotype.Component

@Component
class GraphQlStatsMapper {
    fun toDto(stats: Stats): StatsDto =
        StatsDto(
            additions = stats.additions,
            deletions = stats.deletions,
            kind = stats.kind
        )
}
