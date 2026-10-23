package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import org.springframework.stereotype.Component
import kotlin.uuid.Uuid

/**
 * Adds the `iid` field to existing branches that don't have one.
 *
 * The `iid` (immutable identifier) is a UUID that provides a stable identity
 * for branches independent of the ArangoDB document key. This migration
 * backfills the field for any branches created before this field was added.
 *
 * Uses Kotlin's [Uuid] class to generate UUIDs for consistency with domain model.
 */
@Component
@Suppress("ktlint:standard:class-naming")
class V002_AddBranchIid : Migration {
    companion object {
        private val logger by logger()
    }

    override val version = 1770051416
    override val description = "Add iid (UUID) field to branches collection"

    override fun migrate(db: ArangoDatabase) {
        // Get all commit keys that don't have an iid
        val keysWithoutIid =
            db
                .query(
                    "FOR c IN branches FILTER c.iid == null RETURN c._key",
                    String::class.java,
                ).asListRemaining()

        if (keysWithoutIid.isEmpty()) {
            logger.info("No branches need iid backfill")
            return
        }

        // Generate Kotlin UUIDs and create update map
        val updates =
            keysWithoutIid.map { key ->
                mapOf("_key" to key, "iid" to Uuid.random().toString())
            }

        // Batch update all branches
        db.query(
            """
            FOR updt IN @updates
            UPDATE updt._key WITH { iid: updt.iid } IN branches
            """.trimIndent(),
            Void::class.java,
            mapOf("updates" to updates),
        )

        logger.info("Updated {} branches with new iid", keysWithoutIid.size)
    }
}
