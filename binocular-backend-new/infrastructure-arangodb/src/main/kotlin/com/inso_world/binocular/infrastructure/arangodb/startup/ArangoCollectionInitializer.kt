package com.inso_world.binocular.infrastructure.arangodb.startup

import com.arangodb.entity.CollectionType
import com.arangodb.model.CollectionCreateOptions
import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.ArangodbAppConfig
import jakarta.annotation.PostConstruct
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

/**
 * Ensures required ArangoDB collections exist when running with the "arangodb" profile.
 *
 * This prevents runtime failures like:
 *   org.springframework.dao.InvalidDataAccessResourceUsageException: ... Error: 1203 - collection or view not found: files
 * by proactively creating missing collections used by queries/entities.
 */
@Component
@Order(1) // Run before MigrationRunner
class ArangoCollectionInitializer(
    private val arangodbAppConfig: ArangodbAppConfig,
) {
    companion object {
        private val logger by logger()
    }

    @PostConstruct
    fun ensureCollections() {
        val arango = arangodbAppConfig.arango().build()
        val dbName = arangodbAppConfig.database()
        val db = arango.db(dbName)

        if (!db.exists()) {
            logger.info("Arango database ${db.name()} does not exist, creating it")
            require(db.create()) { "Arango Database creation failed" }
        }

        logger.info("Ensuring required ArangoDB collections exist in database: {}", dbName)

        // Document collections
        ensureDocumentCollection(dbName, "branches")
        ensureDocumentCollection(dbName, "files")
        ensureDocumentCollection(dbName, "repositories")
        ensureDocumentCollection(dbName, "projects")
        ensureDocumentCollection(dbName, "commits")
        ensureDocumentCollection(dbName, "users")
        ensureDocumentCollection(dbName, "developers")
        ensureDocumentCollection(dbName, "issues")
        ensureDocumentCollection(dbName, "mergeRequests")
        ensureDocumentCollection(dbName, "milestones")
        ensureDocumentCollection(dbName, "modules")
        ensureDocumentCollection(dbName, "builds")
        ensureDocumentCollection(dbName, "notes")
        ensureDocumentCollection(dbName, "accounts")
        ensureDocumentCollection(dbName, "projects")
        ensureDocumentCollection(dbName, "repositories")

        // Edge collections
        ensureEdgeCollection(dbName, "accounts-users")
        ensureEdgeCollection(dbName, "branches-files")
        ensureEdgeCollection(dbName, "branch-files-files")
        ensureEdgeCollection(dbName, "commits-builds")
        ensureEdgeCollection(dbName, "commits-commits")
        ensureEdgeCollection(dbName, "commits-files")
        ensureEdgeCollection(dbName, "commit-files-users")
        ensureEdgeCollection(dbName, "commits-modules")
        ensureEdgeCollection(dbName, "commits-users")
        ensureEdgeCollection(dbName, "issues-accounts")
        ensureEdgeCollection(dbName, "issues-commits")
        ensureEdgeCollection(dbName, "issues-milestones")
        ensureEdgeCollection(dbName, "issues-notes")
        ensureEdgeCollection(dbName, "issues-users")
        ensureEdgeCollection(dbName, "mergeRequests-accounts")
        ensureEdgeCollection(dbName, "mergeRequests-milestones")
        ensureEdgeCollection(dbName, "mergeRequests-notes")
        ensureEdgeCollection(dbName, "modules-files")
        ensureEdgeCollection(dbName, "modules-modules")
        ensureEdgeCollection(dbName, "notes-accounts")
    }

    private fun ensureDocumentCollection(
        dbName: String,
        name: String
    ) {
        try {
            val arango = arangodbAppConfig.arango().build()
            val db = arango.db(dbName)
            val collection = db.collection(name)
            if (!collection.exists()) {
                db.createCollection(name)
                logger.info("Created missing ArangoDB document collection: {}", name)
            } else {
                logger.debug("ArangoDB document collection exists: {}", name)
            }
        } catch (e: Exception) {
            logger.warn("Failed to ensure document collection '{}': {}", name, e.message)
        }
    }

    private fun ensureEdgeCollection(
        dbName: String,
        name: String
    ) {
        try {
            val arango = arangodbAppConfig.arango().build()
            val db = arango.db(dbName)
            val collection = db.collection(name)
            if (!collection.exists()) {
                val opts = CollectionCreateOptions().type(CollectionType.EDGES)
                db.createCollection(name, opts)
                logger.info("Created missing ArangoDB edge collection: {}", name)
            } else {
                logger.debug("ArangoDB edge collection exists: {}", name)
            }
        } catch (e: Exception) {
            logger.warn("Failed to ensure edge collection '{}': {}", name, e.message)
        }
    }
}
