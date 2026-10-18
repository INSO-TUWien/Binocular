package com.inso_world.binocular.infrastructure.test.base

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.test.context.junit.jupiter.EnabledIf

internal class ContainerChecks : BaseInfrastructureSpringTest() {
    @Test
    @EnabledIf(
        expression = "#{environment.acceptsProfiles('arangodb')}",
        reason = "🏋🏻‍ Because spring.profiles.active = arangodb",
        loadContext = true
    )
    fun checkAdbContainerIsRunning() {
        assertTrue(com.inso_world.binocular.infrastructure.arangodb.ArangodbTestConfig.adbContainer.isRunning)
    }

    @Test
    @EnabledIf(
        expression = "#{environment.acceptsProfiles('postgres')}",
        reason = "🏋🏻‍ Because spring.profiles.active = postgres",
        loadContext = true
    )
    fun checkPgContainerIsRunning() {
        assertTrue(com.inso_world.binocular.infrastructure.sql.SqlTestConfig.pg.isRunning)
    }
}
