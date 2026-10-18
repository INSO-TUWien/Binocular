package com.inso_world.binocular.infrastructure.arangodb

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
    classes = [ArangodbTestConfig::class],
    initializers = [
        ArangodbTestConfig.Initializer::class,
    ]
)
@ExtendWith(SpringExtension::class)
internal class ContainerCheck : BaseIntegrationTest() {
    @Test
    fun `check if arangodb container is running`() {
        assertTrue(ArangodbTestConfig.adbContainer.isRunning)
    }
}
