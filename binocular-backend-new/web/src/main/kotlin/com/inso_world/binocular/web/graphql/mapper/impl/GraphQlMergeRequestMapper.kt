package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.web.graphql.model.MergeRequestDto
import org.springframework.stereotype.Component

@Component
class GraphQlMergeRequestMapper(
    private val mentionMapper: GraphQlMentionMapper
) {
    fun toDto(mergeRequest: MergeRequest): MergeRequestDto =
        MergeRequestDto(
            id = mergeRequest.id,
            iid = mergeRequest.platformIid,
            title = mergeRequest.title,
            description = mergeRequest.description,
            createdAt = mergeRequest.createdAt,
            closedAt = mergeRequest.closedAt,
            updatedAt = mergeRequest.updatedAt,
            labels = mergeRequest.labels,
            state = mergeRequest.state,
            webUrl = mergeRequest.webUrl,
            mentions = mergeRequest.mentions.map { mentionMapper.toDto(it) },
            sourceBranch = null, // Not directly available in domain model
            targetBranch = null // Not directly available in domain model
        )
}
