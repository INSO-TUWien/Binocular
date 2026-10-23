package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import org.springframework.stereotype.Component
import kotlin.uuid.Uuid

/**
 * Adds the `iid` field to existing commits that don't have one.
 *
 * The `iid` (immutable identifier) is a UUID that provides a stable identity
 * for commits independent of the ArangoDB document key. This migration
 * backfills the field for any commits created before this field was added.
 *
 * Uses Kotlin's [Uuid] class to generate UUIDs for consistency with domain model.
 */
@Component
@Suppress("ktlint:standard:class-naming")
class V001_AddCommitIid : Migration {
    companion object {
        private val logger by logger()
    }

    override val version = 1769792216
    override val description = "Add iid (UUID) field to commits collection"

    override fun migrate(db: ArangoDatabase) {
        // Get all commit keys that don't have an iid
        val keysWithoutIid =
            db
                .query(
                    "FOR c IN commits FILTER c.iid == null RETURN c._key",
                    String::class.java,
                ).asListRemaining()

        if (keysWithoutIid.isEmpty()) {
            logger.info("No commits need iid backfill")
            return
        }

        // Generate Kotlin UUIDs and create update map
        val updates =
            keysWithoutIid.map { key ->
                mapOf("_key" to key, "iid" to Uuid.random().toString())
            }

        // Batch update all commits
        db.query(
            """
            FOR updt IN @updates
            UPDATE updt._key WITH { iid: updt.iid } IN commits
            """.trimIndent(),
            Void::class.java,
            mapOf("updates" to updates),
        )

        logger.info("Updated {} commits with new iid", keysWithoutIid.size)
    }
}
