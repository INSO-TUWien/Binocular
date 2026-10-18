package com.inso_world.binocular.infrastructure.arangodb.service

import com.arangodb.ArangoDB
import com.arangodb.ArangoDatabase
import com.arangodb.entity.CollectionEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.ArangodbAppConfig
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

/**
 * Unit tests with mocks that test the functionality of DbExportServiceImpl.
 */
class DbExportServiceTest {
    private val arangodbAppConfig = mockk<ArangodbAppConfig>()
    private val service = DbExportPortImpl(arangodbAppConfig)

    @Test
    fun `should export data from mocked database`() {
        // prepare mocks
        val builder = mockk<ArangoDB.Builder>()
        val arango = mockk<ArangoDB>()
        val database = mockk<ArangoDatabase>()

        val collection1 =
            mockk<CollectionEntity> {
                every { isSystem } returns false
                every { name } returns "test-collection1"
            }
        val collection2 =
            mockk<CollectionEntity> {
                every { isSystem } returns false
                every { name } returns "test-collection2"
            }
        val systemCollection =
            mockk<CollectionEntity> {
                every { isSystem } returns true
                every { name } returns "_system"
            }

        val dataForCollection1 = listOf(mapOf("key" to "value1"))
        val dataForCollection2 = listOf(mapOf("key" to "value2"))

        every { arangodbAppConfig.arango() } returns builder
        every { builder.build() } returns arango
        every { arangodbAppConfig.database() } returns "testdb"

        // ArangoDB returns the database
        every { arango.db("testdb") } returns database

        // database returns collections including a system collection that will be ignored
        every { database.collections } returns listOf(collection1, collection2, systemCollection)

        // query for collection1 returns dataForCollection1
        every {
            database.query(
                "FOR doc IN @@collection RETURN doc",
                Map::class.java,
                mapOf("@collection" to "test-collection1")
            )
        } returns
            mockk {
                every { asListRemaining() } returns dataForCollection1
            }
        // query for collection2 returns dataForCollection2
        every {
            database.query(
                "FOR doc IN @@collection RETURN doc",
                Map::class.java,
                mapOf("@collection" to "test-collection2")
            )
        } returns
            mockk {
                every { asListRemaining() } returns dataForCollection2
            }

        // initialize service
        val service = DbExportPortImpl(arangodbAppConfig)

        // call the function
        val result = service.exportDb()

        // expected result
        val expected =
            mapOf(
                "test_collection1" to dataForCollection1,
                "test_collection2" to dataForCollection2
            )

        // compare expected result with result
        assertEquals(expected, result)
    }

    @Test
    fun `should return empty map when database has no user-defined collections`() {
        val builder = mockk<ArangoDB.Builder>()
        val arango = mockk<ArangoDB>()
        val database = mockk<ArangoDatabase>()

        // mock system collection only
        val systemCollection =
            mockk<CollectionEntity> {
                every { isSystem } returns true
                every { name } returns "_system"
            }

        every { arangodbAppConfig.arango() } returns builder
        every { builder.build() } returns arango
        every { arangodbAppConfig.database() } returns "testdb"
        every { arango.db("testdb") } returns database
        every { database.collections } returns listOf(systemCollection)

        // call the function
        val result = service.exportDb()

        // assert result is an empty map
        assertEquals(emptyMap<String, Any>(), result)
    }

    @Test
    fun `should throw exception when database connection fails`() {
        // mock the behaviour of the call
        every { arangodbAppConfig.arango().build() } throws RuntimeException("Error while connecting to database")

        // assert that calling the service throws a RuntimeException
        assertThrows<RuntimeException> {
            service.exportDb()
        }

        verify { arangodbAppConfig.arango().build() }
    }
}
