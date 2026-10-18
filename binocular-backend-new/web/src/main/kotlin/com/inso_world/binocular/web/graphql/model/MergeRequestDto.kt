package com.inso_world.binocular.web.graphql.model

import com.inso_world.binocular.web.graphql.model.MentionDto

data class MergeRequestDto(
    var id: String? = null,
    var iid: Int? = null,
    var title: String? = null,
    var description: String? = null,
    var createdAt: String? = null,
    var closedAt: String? = null,
    var updatedAt: String? = null,
    var labels: List<String> = emptyList(),
    var state: String? = null,
    var webUrl: String? = null,
    var mentions: List<MentionDto> = emptyList(),
    var sourceBranch: String? = null,
    var targetBranch: String? = null,
)
