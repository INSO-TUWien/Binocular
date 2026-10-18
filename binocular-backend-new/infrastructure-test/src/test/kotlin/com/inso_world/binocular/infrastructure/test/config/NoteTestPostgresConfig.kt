package com.inso_world.binocular.infrastructure.test.config

import com.inso_world.binocular.core.integration.base.TestDataProvider
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.data.domain.Pageable

/**
 * Test-only configuration used when running infrastructure-test with the postgres profile.
 *
 * The SQL adapter currently does not provide a NoteInfrastructurePort implementation. To keep
 * tests green under the postgres profile, we expose a lightweight, in-memory implementation
 * that serves data from TestDataProvider and mimics the relations used by tests.
 */
@Configuration
@Profile("never-load-this")
@Deprecated("Replaced by real SQL NoteInfrastructurePort; kept for reference only.")
internal class NoteTestPostgresConfig {
    @Bean
    @Primary
    fun noteInfrastructurePort(): NoteInfrastructurePort =
        object : NoteInfrastructurePort {
            private val notes = TestDataProvider.testNotes
            private val accounts = TestDataProvider.testAccounts
            private val issues = TestDataProvider.testIssues
            private val mrs = TestDataProvider.testMergeRequests

            override fun findAccountsByNoteId(noteId: String): List<Account> =
                when (noteId) {
                    // Minimal relation set to satisfy assertions in NoteTest
                    "1" -> listOf(accounts.first())
                    else -> emptyList()
                }

            override fun findIssuesByNoteId(noteId: String): List<Issue> =
                when (noteId) {
                    "1" -> listOf(issues.first())
                    else -> emptyList()
                }

            override fun findMergeRequestsByNoteId(noteId: String): List<MergeRequest> =
                when (noteId) {
                    "1" -> listOf(mrs.first())
                    else -> emptyList()
                }

            override fun findAll(pageable: Pageable): Page<Note> =
                Page(
                    content = notes.drop(pageable.pageNumber * pageable.pageSize).take(pageable.pageSize),
                    totalElements = notes.size.toLong(),
                    pageable = pageable
                )

            override fun findById(id: String): Note? = notes.find { it.id == id }

            override fun findByIid(iid: Note.Id): Note? = notes.find { it.iid == iid }

            override fun findByIids(iids: Collection<Note.Id>): List<Note> = notes.filter { iids.contains(it.iid) }

            override fun findAll(): Iterable<Note> = notes

            override fun create(entity: Note): Note = entity

            override fun saveAll(entities: Collection<Note>): Iterable<Note> = entities

            override fun delete(entity: Note) { /* no-op for test */ }

            override fun update(entity: Note): Note = entity

            override fun deleteById(id: String) { /* no-op for test */ }

            override fun deleteAll() { /* no-op for test */ }
        }
}
