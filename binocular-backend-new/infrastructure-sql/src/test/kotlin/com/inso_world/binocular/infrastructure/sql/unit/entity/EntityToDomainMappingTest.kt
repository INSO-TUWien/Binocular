@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.unit.entity

import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MilestoneEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.uuid.Uuid

/**
 * Verifies entity [toDomain] helpers preserve persisted technical IDs and relationship ID sets
 * for the ID-based domain architecture (issue #454).
 */
internal class EntityToDomainMappingTest {
    @Test
    fun `IssueEntity_toDomain preserves iid and noteIds`() {
        val project = ProjectEntity(name = "p", iid = Project.Id(Uuid.parse("11111111-1111-1111-1111-111111111111")))
        val issueIid = Issue.Id(Uuid.parse("22222222-2222-2222-2222-222222222222"))
        val noteIid = Note.Id(Uuid.parse("33333333-3333-3333-3333-333333333333"))

        val note =
            NoteEntity(
                id = 10L,
                iid = noteIid,
                body = "note body",
            )
        val issue =
            IssueEntity(
                project = project,
                gid = "issue-gid-1",
                iid = issueIid,
                id = 5L,
                title = "issue title",
            ).apply {
                notes.add(note)
            }

        val domain = issue.toDomain()

        assertThat(domain.iid).isEqualTo(issueIid)
        assertThat(domain.noteIds).containsExactly(noteIid)
        assertThat(domain.id).isEqualTo("5")
    }

    @Test
    fun `MergeRequestEntity_toDomain preserves iid and relationship id sets`() {
        val project = ProjectEntity(name = "p", iid = Project.Id(Uuid.parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")))
        val mrIid = MergeRequest.Id(Uuid.parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"))
        val noteIid = Note.Id(Uuid.parse("cccccccc-cccc-cccc-cccc-cccccccccccc"))
        val milestoneIid = Milestone.Id(Uuid.parse("dddddddd-dddd-dddd-dddd-dddddddddddd"))
        val accountIid = Account.Id(Uuid.parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"))

        val note = NoteEntity(id = 1L, iid = noteIid, body = "n")
        val milestone = MilestoneEntity(id = 2L, iid = milestoneIid, title = "m")
        val account =
            AccountEntity(
                iid = accountIid,
                gid = "gid-1",
                platform = Platform.GitHub,
                login = "login1",
                name = "Login One",
            ).apply { id = 3L }

        val mr =
            MergeRequestEntity(
                id = 7L,
                iid = mrIid,
                title = "mr title",
                project = project,
            ).apply {
                notes.add(note)
                milestones.add(milestone)
                accounts.add(account)
            }

        val domain = mr.toDomain()

        assertThat(domain.iid).isEqualTo(mrIid)
        assertThat(domain.noteIds).containsExactly(noteIid)
        assertThat(domain.milestoneIds).containsExactly(milestoneIid)
        assertThat(domain.accountIds).containsExactly(accountIid)
        assertThat(domain.id).isEqualTo("7")
    }
}
