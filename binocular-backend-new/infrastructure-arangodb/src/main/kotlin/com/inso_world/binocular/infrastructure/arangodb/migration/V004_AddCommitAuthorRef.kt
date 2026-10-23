package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import org.springframework.stereotype.Component
import kotlin.uuid.Uuid

/**
 * Backfills `author` and `committer` `@Ref` fields on commit documents.
 *
 * Legacy commits store the author relationship exclusively via `commits-users` edges
 * and have no `author`/`committer` document references. The current
 * [CommitEntity][com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity]
 * requires non-null `@Ref` fields for both, causing a [NullPointerException] during
 * deserialization of legacy data.
 *
 * This migration:
 * 1. Creates a `developers` document for each `users` entry that has no matching developer yet
 * 2. Sets the `author` and `committer` fields on every commit that is missing them,
 *    resolving the developer via the existing `commits-users` edge
 */
@Component
@Suppress("ktlint:standard:class-naming")
class V004_AddCommitAuthorRef : Migration {
    companion object {
        private val logger by logger()
    }

    override val version = 1770656190
    override val description = "Add author/committer reference to commits from commits-users edges"

    override fun migrate(db: ArangoDatabase) {
        createDevelopersFromUsers(db)
        backfillCommitAuthorRef(db)
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
}
