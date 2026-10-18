package com.inso_world.binocular.web.graphql.mapper

import com.inso_world.binocular.model.*
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlAccountMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlBranchMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlBuildMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlCommitMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlFileMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlIssueMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlJobMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlMentionMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlMergeRequestMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlMilestoneMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlModuleMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlNoteMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlRevisionMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlStatsMapper
import com.inso_world.binocular.web.graphql.mapper.impl.GraphQlUserMapper
import com.inso_world.binocular.web.graphql.model.*
import org.springframework.stereotype.Component

@Component
class GraphQlMapper(
    private val accountMapper: GraphQlAccountMapper,
    private val mergeRequestMapper: GraphQlMergeRequestMapper,
    private val issueMapper: GraphQlIssueMapper,
    private val branchMapper: GraphQlBranchMapper,
    private val buildMapper: GraphQlBuildMapper,
    private val commitMapper: GraphQlCommitMapper,
    private val fileMapper: GraphQlFileMapper,
    private val milestoneMapper: GraphQlMilestoneMapper,
    private val moduleMapper: GraphQlModuleMapper,
    private val noteMapper: GraphQlNoteMapper,
    private val userMapper: GraphQlUserMapper,
    private val mentionMapper: GraphQlMentionMapper,
    private val jobMapper: GraphQlJobMapper,
    private val revisionMapper: GraphQlRevisionMapper,
    private val statsMapper: GraphQlStatsMapper
) {
    fun toDto(account: Account): AccountDto = accountMapper.toDto(account)

    fun toDto(mergeRequest: MergeRequest): MergeRequestDto = mergeRequestMapper.toDto(mergeRequest)

    fun toDto(issue: Issue): IssueDto = issueMapper.toDto(issue)

    fun toDto(branch: Branch): BranchDto = branchMapper.toDto(branch)

    fun toDto(build: Build): BuildDto = buildMapper.toDto(build)

    fun toDto(commit: Commit): CommitDto = commitMapper.toDto(commit)

    fun toDto(file: File): FileDto = fileMapper.toDto(file)

    fun toDto(milestone: Milestone): MilestoneDto = milestoneMapper.toDto(milestone)

    fun toDto(module: Module): ModuleDto = moduleMapper.toDto(module)

    fun toDto(note: Note): NoteDto = noteMapper.toDto(note)

    fun toDto(user: User): UserDto = userMapper.toDto(user)

    fun toDto(mention: Mention): MentionDto = mentionMapper.toDto(mention)

    fun toDto(job: Job): JobDto = jobMapper.toDto(job)

    fun toDto(revision: Revision): RevisionDto = revisionMapper.toDto(revision)

    fun toDto(stats: Stats): StatsDto = statsMapper.toDto(stats)
}
