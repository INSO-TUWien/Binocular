package com.inso_world.binocular.web.base

import com.inso_world.binocular.infrastructure.arangodb.ArangodbTestConfig
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.test.context.junit.jupiter.EnabledIf

internal class ContainerChecks : AbstractWebIntegrationTest() {
    @Test
    @EnabledIf(
        expression = "#{environment.acceptsProfiles('arangodb')}",
        reason = "🏋🏻‍ Because spring.profiles.active = arangodb",
        loadContext = true
    )
    fun checkAdbContainerIsRunning() {
        assertTrue(ArangodbTestConfig.adbContainer.isRunning)
    }
}
