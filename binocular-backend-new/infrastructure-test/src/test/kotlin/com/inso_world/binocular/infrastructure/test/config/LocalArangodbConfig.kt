package com.inso_world.binocular.infrastructure.test.config

import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.context.annotation.Profile

@Profile("arangodb")
@Import(com.inso_world.binocular.infrastructure.arangodb.ArangodbTestConfig::class)
@Configuration
internal class LocalArangodbConfig
