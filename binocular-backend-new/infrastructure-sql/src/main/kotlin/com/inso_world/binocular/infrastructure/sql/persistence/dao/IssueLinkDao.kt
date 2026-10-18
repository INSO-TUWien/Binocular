package com.inso_world.binocular.infrastructure.sql.persistence.dao

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import org.springframework.stereotype.Repository

@Repository
internal class IssueLinkDao {
    @PersistenceContext
    private lateinit var em: EntityManager

    fun findAccountIdsByIssueId(issueId: String): List<String> =
        em
            .createNativeQuery("select account_id from issue_account where issue_id = ?1")
            .setParameter(1, issueId)
            .resultList
            .map { it.toString() }

    fun findCommitIdsByIssueId(issueId: String): List<String> =
        em
            .createNativeQuery("select commit_id from issue_commit where issue_id = ?1")
            .setParameter(1, issueId)
            .resultList
            .map { it.toString() }

    fun findMilestoneIdsByIssueId(issueId: String): List<String> =
        em
            .createNativeQuery("select milestone_id from issue_milestone where issue_id = ?1")
            .setParameter(1, issueId)
            .resultList
            .map { it.toString() }

    fun findNoteIdsByIssueId(issueId: String): List<String> =
        em
            .createNativeQuery("select note_id from issue_note where issue_id = ?1")
            .setParameter(1, issueId)
            .resultList
            .map { it.toString() }

    fun findUserIdsByIssueId(issueId: String): List<String> =
        em
            .createNativeQuery("select user_id from issue_user where issue_id = ?1")
            .setParameter(1, issueId)
            .resultList
            .map { it.toString() }

    fun deleteLinksByIssueId(issueId: String) {
        em.createNativeQuery("delete from issue_account where issue_id = ?1").setParameter(1, issueId).executeUpdate()
        em.createNativeQuery("delete from issue_commit where issue_id = ?1").setParameter(1, issueId).executeUpdate()
        em.createNativeQuery("delete from issue_milestone where issue_id = ?1").setParameter(1, issueId).executeUpdate()
        em.createNativeQuery("delete from issue_note where issue_id = ?1").setParameter(1, issueId).executeUpdate()
        em.createNativeQuery("delete from issue_user where issue_id = ?1").setParameter(1, issueId).executeUpdate()
    }

    fun deleteAllLinks() {
        em.createNativeQuery("delete from issue_account").executeUpdate()
        em.createNativeQuery("delete from issue_commit").executeUpdate()
        em.createNativeQuery("delete from issue_milestone").executeUpdate()
        em.createNativeQuery("delete from issue_note").executeUpdate()
        em.createNativeQuery("delete from issue_user").executeUpdate()
    }
}
