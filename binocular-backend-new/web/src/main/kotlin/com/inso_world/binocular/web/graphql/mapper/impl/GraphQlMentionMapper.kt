package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Mention
import com.inso_world.binocular.web.graphql.model.MentionDto
import org.springframework.stereotype.Component

@Component
class GraphQlMentionMapper {
    fun toDto(mention: Mention): MentionDto =
        MentionDto(
            commit = mention.commit,
            createdAt = mention.createdAt,
            closes = mention.closes
        )
}
