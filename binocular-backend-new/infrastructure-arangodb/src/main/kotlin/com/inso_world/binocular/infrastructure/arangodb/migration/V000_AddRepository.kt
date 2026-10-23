package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.infrastructure.arangodb.InfrastructureConfig
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
class V000_AddRepository(
    private val infraConfig: InfrastructureConfig,
) : Migration {
    companion object {
        private val logger by logger()
    }

    override val version = 1770664325
    override val description = "Create default repository for binocular migrations"

    override fun migrate(db: ArangoDatabase) {
        val iid = Uuid.random().toString()
        val defaultProjectName = runCatching { infraConfig.arangodb.migration.defaultProjectName }.getOrDefault("binocular")

        val query =
            """
            LET proj = (
                FOR p IN projects
                FILTER p.name == @projectName
                LIMIT 1
                RETURN p
            )[0]
            INSERT {
                iid: @iid,
                localPath: "./",
                project: proj._id
            }
            INTO repositories
            RETURN NEW
            """.trimIndent()
        val result =
            db
                .query(
                    query,
                    Map::class.java,
                    mapOf(
                        "iid" to iid,
                        "projectName" to defaultProjectName,
                    ),
                ).asListRemaining()

        logger.info("Inserted repository: {}", result)
    }
}
