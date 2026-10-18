package com.inso_world.binocular.infrastructure.sql.persistence.dao

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Repository

@Repository
internal class NoteLinkDao {
    @PersistenceContext
    private lateinit var em: EntityManager

    fun findAccountIdsByNoteId(noteId: String): List<String> =
        em
            .createNativeQuery("select account_id from note_account where note_id = ?1")
            .setParameter(1, noteId)
            .resultList
            .map { it.toString() }

    fun findIssueIdsByNoteId(noteId: String): List<String> =
        em
            .createNativeQuery("select issue_id from issue_note where note_id = ?1")
            .setParameter(1, noteId)
            .resultList
            .map { it.toString() }

    fun findMergeRequestIdsByNoteId(noteId: String): List<String> =
        em
            .createNativeQuery("select merge_request_id from merge_request_note where note_id = ?1")
            .setParameter(1, noteId)
            .resultList
            .map { it.toString() }

    fun deleteLinksByNoteId(noteId: String) {
        em.createNativeQuery("delete from note_account where note_id = ?1").setParameter(1, noteId).executeUpdate()
        em.createNativeQuery("delete from issue_note where note_id = ?1").setParameter(1, noteId).executeUpdate()
        em.createNativeQuery("delete from merge_request_note where note_id = ?1").setParameter(1, noteId).executeUpdate()
    }

    fun deleteAllLinks() {
        em.createNativeQuery("delete from note_account").executeUpdate()
        em.createNativeQuery("delete from issue_note").executeUpdate()
        em.createNativeQuery("delete from merge_request_note").executeUpdate()
    }
}
