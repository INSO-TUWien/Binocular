package com.inso_world.binocular.web.graphql.mapper.impl

import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.web.graphql.model.IssueDto
import org.springframework.stereotype.Component

@Component
class GraphQlIssueMapper(
    private val mentionMapper: GraphQlMentionMapper
) {
    fun toDto(issue: Issue): IssueDto =
        IssueDto(
            id = issue.id,
            iid = issue.platformIid,
            title = issue.title,
            description = issue.description,
            createdAt = issue.createdAt,
            closedAt = issue.closedAt,
            updatedAt = issue.updatedAt,
            labels = issue.labels,
            state = issue.state,
            webUrl = issue.webUrl,
            mentions = issue.mentions.map { mentionMapper.toDto(it) },
            authorId = issue.authorId?.value?.toString(),
            accountIds = issue.accountIds.map { it.value.toString() }.toSet(),
            commitIds = issue.commitIds.map { it.value.toString() }.toSet(),
            milestoneIds = issue.milestoneIds.map { it.value.toString() }.toSet(),
            noteIds = issue.noteIds.map { it.value.toString() }.toSet(),
        )
}
