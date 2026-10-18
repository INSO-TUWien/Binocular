package com.inso_world.binocular.infrastructure.sql

import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

@Configuration
@Import(SqlAppConfig::class)
class SqlTestConfig {
    companion object {
        val pg: PostgreSQLContainer<*> =
            PostgreSQLContainer(DockerImageName.parse("postgres:17-alpine"))
                .apply { withDatabaseName("binocular_it") }
                .apply { withUsername("postgres") }
                .apply { withPassword("postgres") }
    }

    class Initializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
        override fun initialize(ctx: ConfigurableApplicationContext) {
            pg.start()

            TestPropertyValues
                .of(
                    // Standard Spring DataSource-Props
                    "spring.datasource.url=${pg.jdbcUrl}",
                    "spring.datasource.username=${pg.username}",
                    "spring.datasource.password=${pg.password}",
                    "spring.datasource.driver-class-name=org.postgresql.Driver",
                ).applyTo(ctx.environment)
        }
    }
}
