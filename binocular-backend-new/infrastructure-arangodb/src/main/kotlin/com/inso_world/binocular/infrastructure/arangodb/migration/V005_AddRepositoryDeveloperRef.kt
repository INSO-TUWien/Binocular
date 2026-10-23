package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import org.springframework.stereotype.Component
import kotlin.uuid.Uuid

/**
 * Backfills `repository` `@Ref` fields on developer documents.
 *
 * The current
 * [DeveloperEntity][com.inso_world.binocular.infrastructure.arangodb.persistence.entity.DeveloperEntity]
 * requires a non-null `@Ref repository` field, but legacy developer documents
 * (created by earlier migrations or direct user-to-developer promotion) may lack it.
 *
 * This migration:
 * 1. Creates a `developers` document for each `users` entry that has no matching developer yet
 *    (safety-net for data that was not migrated by V004)
 * 2. Backfills `author`/`committer` on commits still missing them (safety-net for V004)
 * 3. Sets the `repository` field on every developer that is missing it, deriving the
 *    repository from the commits that reference the developer as author or committer
 */
@Component
@Suppress("ktlint:standard:class-naming")
class V005_AddRepositoryDeveloperRef : Migration {
    companion object {
        private val logger by logger()
    }

    override val version = 1770712550
    override val description = "Add repository reference to developer"

    override fun migrate(db: ArangoDatabase) {
        createDevelopersFromUsers(db)
        backfillCommitAuthorRef(db)
        backfillDeveloperRepositoryRef(db)
    }

    /**
     * For every user that has no corresponding developer (matched by `gitSignature`),
     * inserts a new developer document with a generated `iid`.
     */
    private fun createDevelopersFromUsers(db: ArangoDatabase) {
        val usersWithoutDeveloper =
            db
                .query(
                    """
                    FOR u IN users
                    LET existing = (
                        FOR d IN developers
                        FILTER d.gitSignature == u.gitSignature
                        LIMIT 1
                        RETURN d
                    )
                    FILTER LENGTH(existing) == 0
                    RETURN u
                    """.trimIndent(),
                    Map::class.java,
                ).asListRemaining()

        if (usersWithoutDeveloper.isEmpty()) {
            logger.info("All users already have a matching developer")
            return
        }

        val developerDocs =
            usersWithoutDeveloper.map { user ->
                mapOf(
                    "gitSignature" to user["gitSignature"],
                    "iid" to Uuid.random().toString(),
                )
            }

        db.query(
            """
            FOR doc IN @developers
            INSERT doc INTO developers
            """.trimIndent(),
            Void::class.java,
            mapOf("developers" to developerDocs),
        )

        logger.info("Created {} developer(s) from users", developerDocs.size)
    }

    /**
     * For every commit that has no `author` field, looks up the user via the
     * `commits-users` edge, finds the matching developer by `gitSignature`,
     * and sets both `author` and `committer` to that developer's document ID.
     */
    private fun backfillCommitAuthorRef(db: ArangoDatabase) {
        val result =
            db
                .query(
                    """
                    FOR c IN commits
                    FILTER c.author == null
                    LET userEdge = FIRST(
                        FOR v, e IN 1..1 OUTBOUND c `commits-users`
                        RETURN v
                    )
                    FILTER userEdge != null
                    LET dev = FIRST(
                        FOR d IN developers
                        FILTER d.gitSignature == userEdge.gitSignature
                        RETURN d
                    )
                    FILTER dev != null
                    UPDATE c WITH { author: dev._id, committer: dev._id } IN commits
                    RETURN 1
                    """.trimIndent(),
                    Int::class.java,
                ).asListRemaining()

        val updatedCount = result.size
        if (updatedCount == 0) {
            logger.info("No commits need author/committer backfill")
        } else {
            logger.info("Updated {} commits with author/committer reference", updatedCount)
        }
    }

    /**
     * For every developer that has no `repository` field, derives the repository from
     * commits that reference the developer as `author` or `committer` and sets it.
     *
     * Falls back to the first available repository when no commit link exists,
     * which covers edge cases where a developer was created from a user that has
     * no commits (e.g. issue-only contributors).
     */
    private fun backfillDeveloperRepositoryRef(db: ArangoDatabase) {
        val result =
            db
                .query(
                    """
                    LET fallbackRepo = FIRST(
                        FOR r IN repositories
                        LIMIT 1
                        RETURN r._id
                    )
                    FOR d IN developers
                    FILTER d.repository == null
                    LET commitRepo = FIRST(
                        FOR c IN commits
                        FILTER c.author == d._id OR c.committer == d._id
                        FILTER c.repository != null
                        LIMIT 1
                        RETURN c.repository
                    )
                    LET repo = commitRepo != null ? commitRepo : fallbackRepo
                    FILTER repo != null
                    UPDATE d WITH { repository: repo } IN developers
                    RETURN 1
                    """.trimIndent(),
                    Int::class.java,
                ).asListRemaining()

        val updatedCount = result.size
        if (updatedCount == 0) {
            logger.info("No developers need repository backfill")
        } else {
            logger.info("Updated {} developer(s) with repository reference", updatedCount)
        }
    }
}
