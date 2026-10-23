package com.inso_world.binocular.infrastructure.sql.integration.service

import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.TestData
import com.inso_world.binocular.infrastructure.sql.integration.service.base.BaseServiceTest
import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.service.NoteInfrastructurePortImpl
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import kotlin.uuid.Uuid

@Transactional
internal class NoteInfrastructurePortImplTest : BaseServiceTest() {
    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    private lateinit var accountPort: AccountInfrastructurePort

    @Autowired
    private lateinit var notePort: NoteInfrastructurePortImpl

    @PersistenceContext
    private lateinit var em: EntityManager

    private lateinit var project: Project
    private lateinit var projectEntity: ProjectEntity
    private lateinit var account: Account
    private lateinit var noteEntity: NoteEntity
    private lateinit var issueEntity: IssueEntity
    private lateinit var mergeRequestEntity: MergeRequestEntity

    private val noteIid = Note.Id(Uuid.parse("b1111111-1111-1111-1111-111111111111"))
    private val issueIid = Issue.Id(Uuid.parse("b2222222-2222-2222-2222-222222222222"))
    private val mrIid = MergeRequest.Id(Uuid.parse("b3333333-3333-3333-3333-333333333333"))

    @BeforeEach
    fun setup() {
        project = projectPort.create(TestData.Domain.testProject(name = "Note Port Test Project", id = null))
        projectEntity = em.find(ProjectEntity::class.java, project.id!!.toLong())

        account =
            accountPort.create(
                Account(
                    gid = "note-account-gid",
                    platform = Platform.GitHub,
                    login = "note-user",
                    projectIds = mutableSetOf(project.iid),
                ).apply {
                    name = "Note User"
                }
            )
        val accountEntity =
            em
                .createQuery(
                    "select a from AccountEntity a where a.login = :login",
                    AccountEntity::class.java,
                ).setParameter("login", "note-user")
                .singleResult

        issueEntity =
            IssueEntity(
                project = projectEntity,
                gid = "issue-gid-note-test",
                iid = issueIid,
                title = "linked issue",
            ).also { em.persist(it) }

        mergeRequestEntity =
            MergeRequestEntity(
                iid = mrIid,
                title = "linked mr",
                project = projectEntity,
            ).also { em.persist(it) }

        noteEntity =
            NoteEntity(
                iid = noteIid,
                body = "relationship note",
            ).apply {
                accounts.add(accountEntity)
                issues.add(issueEntity)
                mergeRequests.add(mergeRequestEntity)
            }
        em.persist(noteEntity)

        // Keep inverse collections consistent for entity toDomain() paths.
        issueEntity.notes.add(noteEntity)
        mergeRequestEntity.notes.add(noteEntity)
        em.flush()
    }

    @AfterEach
    fun cleanup() {
        tearDown()
    }

    @Nested
    inner class RelationshipLookups {
        @Test
        fun `findAccountsByNoteId returns linked accounts with persisted iid`() {
            val accounts = notePort.findAccountsByNoteId(noteEntity.id!!.toString())

            assertThat(accounts).hasSize(1)
            assertThat(accounts.single().login).isEqualTo("note-user")
            assertThat(accounts.single().iid).isEqualTo(account.iid)
        }

        @Test
        fun `findIssuesByNoteId returns issues with persisted iid and noteIds`() {
            val issues = notePort.findIssuesByNoteId(noteEntity.id!!.toString())

            assertThat(issues).hasSize(1)
            val issue = issues.single()
            assertThat(issue.iid).isEqualTo(issueIid)
            assertThat(issue.noteIds).containsExactly(noteIid)
            assertThat(issue.id).isEqualTo(issueEntity.id!!.toString())
        }

        @Test
        fun `findMergeRequestsByNoteId returns merge requests with persisted iid and relationship sets`() {
            val mergeRequests = notePort.findMergeRequestsByNoteId(noteEntity.id!!.toString())

            assertThat(mergeRequests).hasSize(1)
            val mr = mergeRequests.single()
            assertThat(mr.iid).isEqualTo(mrIid)
            assertThat(mr.noteIds).containsExactly(noteIid)
            assertThat(mr.id).isEqualTo(mergeRequestEntity.id!!.toString())
        }

        @Test
        fun `relationship lookups resolve by technical Uuid iid string`() {
            val byIid = notePort.findIssuesByNoteId(noteIid.value.toString())
            assertThat(byIid).extracting("iid").containsExactly(issueIid)
        }
    }
}
