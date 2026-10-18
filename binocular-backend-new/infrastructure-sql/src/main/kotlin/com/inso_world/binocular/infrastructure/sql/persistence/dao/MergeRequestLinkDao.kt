package com.inso_world.binocular.infrastructure.sql.persistence.dao

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Repository

@Repository
internal class MergeRequestLinkDao {
    @PersistenceContext
    private lateinit var em: EntityManager

    fun findAccountIdsByMergeRequestId(mergeRequestId: String): List<String> =
        em
            .createNativeQuery("select account_id from merge_request_account where merge_request_id = ?1")
            .setParameter(1, mergeRequestId)
            .resultList
            .map { it.toString() }

    fun findMilestoneIdsByMergeRequestId(mergeRequestId: String): List<String> =
        em
            .createNativeQuery("select milestone_id from merge_request_milestone where merge_request_id = ?1")
            .setParameter(1, mergeRequestId)
            .resultList
            .map { it.toString() }

    fun findNoteIdsByMergeRequestId(mergeRequestId: String): List<String> =
        em
            .createNativeQuery("select note_id from merge_request_note where merge_request_id = ?1")
            .setParameter(1, mergeRequestId)
            .resultList
            .map { it.toString() }

    fun deleteLinksByMergeRequestId(mergeRequestId: String) {
        em
            .createNativeQuery(
                "delete from merge_request_account where merge_request_id = ?1"
            ).setParameter(1, mergeRequestId)
            .executeUpdate()
        em
            .createNativeQuery(
                "delete from merge_request_milestone where merge_request_id = ?1"
            ).setParameter(1, mergeRequestId)
            .executeUpdate()
        em.createNativeQuery("delete from merge_request_note where merge_request_id = ?1").setParameter(1, mergeRequestId).executeUpdate()
    }

    fun deleteAllLinks() {
        em.createNativeQuery("delete from merge_request_account").executeUpdate()
        em.createNativeQuery("delete from merge_request_milestone").executeUpdate()
        em.createNativeQuery("delete from merge_request_note").executeUpdate()
    }
}
