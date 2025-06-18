package com.inso_world.binocular.web.service

import com.arangodb.ArangoDBException
import com.inso_world.binocular.web.persistence.dao.nosql.arangodb.AdbConfig
import org.springframework.stereotype.Service
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@Service
class DbExportService (private val arangoConfig: AdbConfig) {

  var logger: Logger = LoggerFactory.getLogger(DbExportService::class.java)

  fun exportDb(): Map<String, Any> {
    logger.trace("Starting the database export...")
    val exportJson = mutableMapOf<String, Any>()

    try {
      val arango = arangoConfig.arango().build()
      val database = arango.db(arangoConfig.database())
      logger.debug("Connected to database: ${arangoConfig.database()}")

      val collections = database.collections
        .filter { !it.isSystem }
      logger.debug("Found ${collections.size} collections to export")

      collections.forEach { collection ->
        val sanitizedName = collection.name.replace("-", "_")
        val query = "FOR doc IN @@collection RETURN doc"
        val bindVars = mapOf("@collection" to collection.name)

        try {
          logger.trace("Exporting collection ${collection.name}")
          val cursor = database.query(query, Map::class.java, bindVars)
          exportJson[sanitizedName] = cursor.asListRemaining()
        } catch (e: ArangoDBException) {
          logger.warn("Error while exporting collection ${collection.name}")
          exportJson[sanitizedName] = mapOf("error" to e.message)
        }
      }
    } catch (e: ArangoDBException) {
      logger.error("Error while connecting to database", e)
      throw RuntimeException("Error while connecting to database", e)
    } catch (e: Exception) {
      logger.error("Unexpected error while exporting database", e)
      throw RuntimeException("Unexpected error while exporting database", e)
    }

    logger.info("Successfully exported the database")
    return exportJson
  }

}
