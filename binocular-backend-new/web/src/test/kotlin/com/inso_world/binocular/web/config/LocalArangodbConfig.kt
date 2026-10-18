package com.inso_world.binocular.web.config

import com.inso_world.binocular.infrastructure.arangodb.ArangodbTestConfig
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.context.annotation.Profile

@Profile("arangodb")
@Import(ArangodbTestConfig::class)
@Configuration
internal class LocalArangodbConfig
