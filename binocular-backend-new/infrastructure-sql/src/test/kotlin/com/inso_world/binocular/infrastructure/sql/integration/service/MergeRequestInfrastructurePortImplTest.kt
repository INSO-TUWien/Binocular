@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.integration.service

import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.TestData
import com.inso_world.binocular.infrastructure.sql.integration.service.base.BaseServiceTest
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MilestoneEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.service.MergeRequestInfrastructurePortImpl
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
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
import org.springframework.data.domain.PageRequest
import org.springframework.transaction.annotation.Transactional
import kotlin.uuid.Uuid

@Transactional
internal class MergeRequestInfrastructurePortImplTest : BaseServiceTest() {
    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    private lateinit var accountPort: AccountInfrastructurePort

    @Autowired
    private lateinit var mergeRequestPort: MergeRequestInfrastructurePortImpl

    @PersistenceContext
    private lateinit var em: EntityManager

    private lateinit var project: Project
    private lateinit var projectEntity: ProjectEntity
    private lateinit var account: Account
    private lateinit var mergeRequestEntity: MergeRequestEntity
    private lateinit var noteEntity: NoteEntity
    private lateinit var milestoneEntity: MilestoneEntity

    private val noteIid = Note.Id(Uuid.parse("a1111111-1111-1111-1111-111111111111"))
    private val milestoneIid = Milestone.Id(Uuid.parse("a2222222-2222-2222-2222-222222222222"))
    private val mrIid = MergeRequest.Id(Uuid.parse("a3333333-3333-3333-3333-333333333333"))

    @BeforeEach
    fun setup() {
        project = projectPort.create(TestData.Domain.testProject(name = "MR Port Test Project", id = null))
        projectEntity = em.find(ProjectEntity::class.java, project.id!!.toLong())

        account =
            accountPort.create(
                Account(
                    gid = "mr-account-gid",
                    platform = Platform.GitHub,
                    login = "mr-user",
                    projectIds = mutableSetOf(project.iid),
                ).apply {
                    name = "MR User"
                }
            )
        val accountEntity =
            em
                .createQuery(
                    "select a from AccountEntity a where a.login = :login",
                    com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity::class.java,
                ).setParameter("login", "mr-user")
                .singleResult

        noteEntity = NoteEntity(iid = noteIid, body = "note on mr").also { em.persist(it) }
        milestoneEntity = MilestoneEntity(iid = milestoneIid, title = "milestone-1").also { em.persist(it) }

        mergeRequestEntity =
            MergeRequestEntity(
                iid = mrIid,
                title = "MR title",
                project = projectEntity,
            ).apply {
                accounts.add(accountEntity)
                notes.add(noteEntity)
                milestones.add(milestoneEntity)
            }
        em.persist(mergeRequestEntity)
        em.flush()
    }

    @AfterEach
    fun cleanup() {
        tearDown()
    }

    @Nested
    inner class RelationshipLookups {
        @Test
        fun `findAccountsByMergeRequestId returns linked accounts with persisted iid`() {
            val accounts = mergeRequestPort.findAccountsByMergeRequestId(mergeRequestEntity.id!!.toString())

            assertThat(accounts).hasSize(1)
            assertThat(accounts.single().login).isEqualTo("mr-user")
            assertThat(accounts.single().iid).isEqualTo(account.iid)
        }

        @Test
        fun `findMilestonesByMergeRequestId returns linked milestones with persisted iid`() {
            val milestones = mergeRequestPort.findMilestonesByMergeRequestId(mergeRequestEntity.id!!.toString())

            assertThat(milestones).hasSize(1)
            assertThat(milestones.single().iid).isEqualTo(milestoneIid)
            assertThat(milestones.single().title).isEqualTo("milestone-1")
        }

        @Test
        fun `findNotesByMergeRequestId returns linked notes with persisted iid`() {
            val notes = mergeRequestPort.findNotesByMergeRequestId(mergeRequestEntity.id!!.toString())

            assertThat(notes).hasSize(1)
            assertThat(notes.single().iid).isEqualTo(noteIid)
            assertThat(notes.single().body).isEqualTo("note on mr")
        }

        @Test
        fun `relationship lookups resolve by technical Uuid iid string`() {
            val byIid = mergeRequestPort.findNotesByMergeRequestId(mrIid.value.toString())
            assertThat(byIid).extracting("iid").containsExactly(noteIid)
        }
    }

    @Nested
    inner class DateFilteredPagination {
        @Test
        fun `findAll with since and until ignores date filters on SQL side`() {
            val pageable = PageRequest.of(0, 10)
            val unfiltered = mergeRequestPort.findAll(pageable)
            val filtered = mergeRequestPort.findAll(pageable, since = 0L, until = 1L)

            // Intentional SQL behavior: since/until are ignored (parity with IssueInfrastructurePortImpl).
            assertThat(filtered.content.map { it.iid }).isEqualTo(unfiltered.content.map { it.iid })
            assertThat(filtered.totalElements).isEqualTo(unfiltered.totalElements)
            assertThat(filtered.content.map { it.iid }).contains(mrIid)
        }
    }
}
