package com.inso_world.binocular.infrastructure.sql

import com.inso_world.binocular.core.integration.base.BaseIntegrationTest
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension

@SpringBootTest
@EnableAutoConfiguration
@ContextConfiguration(
    classes = [SqlTestConfig::class],
    initializers = [
        SqlTestConfig.Initializer::class,
    ]
)
@ExtendWith(SpringExtension::class)
internal class ContainerCheck : BaseIntegrationTest() {
    @Test
    fun `check if postgres container is running`() {
        assertTrue(SqlTestConfig.pg.isRunning)
    }
}
