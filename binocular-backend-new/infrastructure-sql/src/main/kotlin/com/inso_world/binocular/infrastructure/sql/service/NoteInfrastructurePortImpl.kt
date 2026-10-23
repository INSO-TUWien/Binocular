package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.persistence.dao.NoteDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.NoteLinkDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.NoteEntity
import com.inso_world.binocular.infrastructure.sql.persistence.mapper.NoteMapper
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import jakarta.validation.Valid
import org.springframework.context.annotation.Profile
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated
import kotlin.uuid.Uuid

@Service
@Profile("postgres")
@Validated
internal class NoteInfrastructurePortImpl(
    private val noteDao: NoteDao,
    private val linkDao: NoteLinkDao,
    private val noteMapper: NoteMapper,
) : NoteInfrastructurePort {
    private fun resolveNoteEntity(noteId: String): NoteEntity? {
        val longId = noteId.toLongOrNull()
        if (longId != null) {
            return noteDao.findById(longId)
        } else {
            return runCatching { Uuid.parse(noteId) }.getOrNull()?.let {
                noteDao.findByIid(Note.Id(it))
            }
        }
    }

    override fun findAccountsByNoteId(noteId: String): List<Account> {
        val entity = resolveNoteEntity(noteId) ?: return emptyList()
        return entity.accounts.map { it.toDomain() }
    }

    override fun findIssuesByNoteId(noteId: String): List<Issue> {
        val entity = resolveNoteEntity(noteId) ?: return emptyList()
        return entity.issues.map { it.toDomain() }
    }

    override fun findMergeRequestsByNoteId(noteId: String): List<MergeRequest> {
        val entity = resolveNoteEntity(noteId) ?: return emptyList()
        return entity.mergeRequests.map { it.toDomain() }
    }

    override fun findAll(pageable: Pageable): Page<Note> {
        val total = noteDao.count()
        if (total == 0L) return Page(emptyList(), 0, pageable)
        val entities = noteDao.findAll(pageable)
        return Page(entities.content.map { noteMapper.toDomain(it) }, total, pageable)
    }

    override fun findById(id: String): Note? = noteDao.findById(id.toLongOrNull() ?: -1L)?.let { noteMapper.toDomain(it) }

    override fun findByIid(iid: Note.Id): @Valid Note? = noteDao.findByIid(iid)?.let { noteMapper.toDomain(it) }

    override fun findByIids(iids: Collection<Note.Id>): List<@Valid Note> = noteDao.findByIids(iids).map { noteMapper.toDomain(it) }

    override fun findAll(): Iterable<Note> = noteDao.findAll().map { noteMapper.toDomain(it) }

    override fun create(entity: Note): Note = noteMapper.toDomain(noteDao.create(noteMapper.toEntity(entity)))

    override fun saveAll(entities: Collection<Note>): Iterable<Note> =
        noteDao
            .saveAll(
                entities.map {
                    noteMapper.toEntity(it)
                }
            ).map { noteMapper.toDomain(it) }

    override fun delete(entity: Note) {
        entity.id?.let { deleteById(it) }
    }

    override fun update(entity: Note): Note = noteMapper.toDomain(noteDao.update(noteMapper.toEntity(entity)))

    override fun deleteById(id: String) {
        linkDao.deleteLinksByNoteId(id)
        id.toLongOrNull()?.let { noteDao.deleteById(it) }
    }

    override fun deleteAll() {
        linkDao.deleteAllLinks()
        noteDao.deleteAll()
    }
}
