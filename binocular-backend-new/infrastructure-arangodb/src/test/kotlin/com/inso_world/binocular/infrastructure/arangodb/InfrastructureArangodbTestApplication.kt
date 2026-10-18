package com.inso_world.binocular.infrastructure.arangodb

import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication(
    scanBasePackages = ["com.inso_world.binocular.infrastructure.arangodb", "com.inso_world.binocular.core"],
)
internal class InfrastructureArangodbTestApplication {
    @Test
    fun contextLoads() {
    }
}
