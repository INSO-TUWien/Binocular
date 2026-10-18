package com.inso_world.binocular.infrastructure.test.base

import com.inso_world.binocular.core.integration.base.InfrastructureDataSetup
import com.inso_world.binocular.infrastructure.test.config.LocalArangodbConfig
import com.inso_world.binocular.infrastructure.test.config.LocalPostgresConfig
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.test.context.ContextConfiguration

/**
 * Base class for infrastructure integration tests. Profiles and properties are now managed via
 * src/test/resources/application.yaml and per-profile files (e.g., application-arangodb.yaml).
 * This base also ensures DB is populated with TestDataProvider data before each test.
 */
@SpringBootTest
@EnableAutoConfiguration
@ContextConfiguration(
    classes = [LocalArangodbConfig::class, LocalPostgresConfig::class],
    initializers = [
        com.inso_world.binocular.infrastructure.arangodb.ArangodbTestConfig.Initializer::class,
        com.inso_world.binocular.infrastructure.sql.SqlTestConfig.Initializer::class
    ]
)
@ComponentScan(basePackages = ["com.inso_world.binocular.infrastructure.test", "com.inso_world.binocular.core"])
@Disabled("Refactored in domain model #454")
abstract class BaseInfrastructureSpringTest {
    @Autowired
    protected lateinit var infrastructureDataSetup: InfrastructureDataSetup

    @BeforeEach
    fun baseSetup() {
        infrastructureDataSetup.setup()
    }

    @AfterEach
    fun baseTearDown() {
        infrastructureDataSetup.teardown()
    }
}
