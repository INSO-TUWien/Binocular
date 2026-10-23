package com.inso_world.binocular.infrastructure.arangodb.migration

import com.arangodb.ArangoDatabase
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.ArangodbAppConfig
import jakarta.annotation.PostConstruct
import org.springframework.context.annotation.DependsOn
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.time.Instant

/**
 * Executes pending ArangoDB migrations on application startup.
 *
 * Migrations are discovered via Spring dependency injection and executed
 * in order based on their version number. Executed migrations are tracked
 * in a `_migrations` collection to ensure each migration runs exactly once.
 *
 * ### Execution Order
 * This component runs after [ArangoCollectionInitializer] (Order 1) to ensure
 * all collections exist before migrations run.
 *
 * ### Migration Tracking
 * The `_migrations` collection stores:
 * - `_key`: Migration version as string
 * - `version`: Migration version number
 * - `description`: Migration description
 * - `executedAt`: ISO timestamp of execution
 */
@Component
@Order(2) // Run after ArangoCollectionInitializer
@DependsOn("arangoCollectionInitializer")
class MigrationRunner(
    private val arangodbAppConfig: ArangodbAppConfig,
    private val migrations: List<Migration>,
) {
    companion object {
        private val logger by logger()
        private const val MIGRATIONS_COLLECTION = "binocular_migrations"
    }

    @PostConstruct
    fun runMigrations() {
        val arango = arangodbAppConfig.arango().build()
        val db = arango.db(arangodbAppConfig.database())

        ensureMigrationsCollection(db)
        val executedVersions = getExecutedVersions(db)

        val pendingMigrations =
            migrations
                .filter { it.version !in executedVersions }
                .sortedBy { it.version }

        if (pendingMigrations.isEmpty()) {
            logger.info("No pending migrations")
            return
        }

        logger.info("Found {} pending migration(s)", pendingMigrations.size)

        for (migration in pendingMigrations) {
            executeMigration(db, migration)
        }

        logger.info("All migrations completed")
    }

    private fun ensureMigrationsCollection(db: ArangoDatabase) {
        val collection = db.collection(MIGRATIONS_COLLECTION)
        if (!collection.exists()) {
            db.createCollection(MIGRATIONS_COLLECTION)
            logger.info("Created migrations tracking collection: {}", MIGRATIONS_COLLECTION)
        }
    }

    private fun getExecutedVersions(db: ArangoDatabase): Set<Int> {
        val cursor =
            db.query(
                "FOR m IN @@collection RETURN m.version",
                Int::class.java,
                mapOf("@collection" to MIGRATIONS_COLLECTION),
            )
        return cursor.asListRemaining().toSet()
    }

    private fun executeMigration(
        db: ArangoDatabase,
        migration: Migration,
    ) {
        logger.info(
            "Running migration V{}: {}",
            migration.version.toString().padStart(3, '0'),
            migration.description,
        )

        try {
            migration.migrate(db)
            recordMigration(db, migration)
            logger.info("Migration V{} completed successfully", migration.version.toString().padStart(3, '0'))
        } catch (e: Exception) {
            logger.error(
                "Migration V{} failed: {}",
                migration.version.toString().padStart(3, '0'),
                e.message,
                e,
            )
            throw MigrationException(migration, e)
        }
    }

    private fun recordMigration(
        db: ArangoDatabase,
        migration: Migration,
    ) {
        db.query(
            """
            INSERT {
                _key: @key,
                version: @version,
                description: @description,
                executedAt: @executedAt
            } INTO @@collection
            """.trimIndent(),
            Void::class.java,
            mapOf(
                "@collection" to MIGRATIONS_COLLECTION,
                "key" to migration.version.toString(),
                "version" to migration.version,
                "description" to migration.description,
                "executedAt" to Instant.now().toString(),
            ),
        )
    }
}

/**
 * Exception thrown when a migration fails.
 */
class MigrationException(
    migration: Migration,
    cause: Throwable,
) : RuntimeException(
        "Migration V${migration.version.toString().padStart(3, '0')} (${migration.description}) failed",
        cause,
    )
