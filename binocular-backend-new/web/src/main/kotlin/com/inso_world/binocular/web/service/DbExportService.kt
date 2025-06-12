package com.inso_world.binocular.web.service

import com.inso_world.binocular.web.persistence.dao.nosql.arangodb.AdbConfig
import org.springframework.stereotype.Service

@Service
class DbExportService (private val arangoConfig: AdbConfig) {

  fun exportDb(): Map<String, Any> {
    val exportJson = mutableMapOf<String, Any>()

    // TODO: add logging
    // TODO: fix the bug (its gone??), error handling

    val arango = arangoConfig.arango().build()
    val database = arango.db(arangoConfig.database())

    val collections = database.collections
      .filter { !it.isSystem }

    collections.forEach { collection ->
      val sanitizedName = collection.name.replace("-", "_")
      val query = "FOR doc IN @@collection RETURN doc"
      val bindVars = mapOf("@collection" to collection.name)

      val cursor = database.query(query, Map::class.java, bindVars)
      exportJson[sanitizedName] = cursor.asListRemaining()
    }

    return exportJson
  }

}
