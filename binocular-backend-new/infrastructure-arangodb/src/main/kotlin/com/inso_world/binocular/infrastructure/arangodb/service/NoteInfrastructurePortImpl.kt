package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.NoteInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.INoteAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.INoteDao
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Note
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Implementation of the NoteService interface.
 * This service is database-agnostic and works with both ArangoDB and SQL implementations.
 */
@Service
internal class NoteInfrastructurePortImpl :
    AbstractInfrastructurePort<Note, String>(),
    NoteInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = noteDao
    }

    @Autowired private lateinit var noteDao: INoteDao

    @Autowired private lateinit var noteAccountConnectionRepository: INoteAccountConnectionDao

    @Autowired private lateinit var issueNoteConnectionRepository: IIssueNoteConnectionDao

    @Autowired private lateinit var mergeRequestNoteConnectionRepository: IMergeRequestNoteConnectionDao
    var logger: Logger = LoggerFactory.getLogger(NoteInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<Note> {
        logger.trace("Getting all notes with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return noteDao.findAll(pageable)
    }

    override fun findById(id: String): Note? {
        logger.trace("Getting note by id: $id")
        return noteDao.findById(id)
    }

    override fun findByIid(iid: Note.Id): @Valid Note? {
        logger.trace("Getting note by iid: $iid")
        return noteDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Note.Id>): List<@Valid Note> {
        logger.trace("Getting notes by iids: $iids")
        return noteDao.findAll().filter { it.iid in iids }
    }

    override fun findAccountsByNoteId(noteId: String): List<Account> {
        logger.trace("Getting accounts for note: $noteId")
        return noteAccountConnectionRepository.findAccountsByNote(noteId)
    }

    override fun findIssuesByNoteId(noteId: String): List<Issue> {
        logger.trace("Getting issues for note: $noteId")
        return issueNoteConnectionRepository.findIssuesByNote(noteId)
    }

    override fun findMergeRequestsByNoteId(noteId: String): List<MergeRequest> {
        logger.trace("Getting merge requests for note: $noteId")
        return mergeRequestNoteConnectionRepository.findMergeRequestsByNote(noteId)
    }

    override fun findAll(): Iterable<Note> = noteDao.findAll()

    override fun create(entity: Note): Note = noteDao.save(entity)

    override fun saveAll(entities: Collection<Note>): Iterable<Note> = noteDao.saveAll(entities)

    override fun delete(entity: Note) = noteDao.delete(entity)

    override fun update(entity: Note): Note {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.noteDao.deleteAll()
    }
}
